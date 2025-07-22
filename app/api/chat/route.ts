import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import ProposalModel from '@/models/proposal'
import RulesBankModel from '@/models/rulesBank'
import { validateWithGuidance} from '@/lib/gemini'
// Thoughtful chatbot interaction for collecting user input for a rule
async function interactWithUser(currentRule: { rule: unknown }, userMessage: unknown) {
  const prompt = `You are an emergency operations plan assistant. Ask the user for the following information in a clear, friendly, and helpful way: "${currentRule.rule}". If the user response is unclear or incomplete, gently ask for clarification or more details.`
  return {
    prompt,
    userMessage
    // response: geminiResponse.response
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { session_id, message } = body

    console.log("📥 Received from frontend:")
    console.log("➡️ session_id:", session_id)
    console.log("📝 message:", message)

    // STEP 2: Find or create proposal
    let proposal = await ProposalModel.findOne({ userId: session_id })

    if (!proposal) {
      console.log("🚧 Proposal not found. Creating new proposal...")
      proposal = await ProposalModel.create({
        userId: session_id,
        status: {
          information: { completed: false, generatedText: null },
          assessment: { completed: false, generatedText: null },
          responsePlan: { completed: false, generatedText: null },
          review: { completed: false, finalGeneratedEOP: null }
        },
        createdAt: new Date(),
        lastUpdated: new Date()
      })
      console.log("✅ New proposal created for session:", session_id)
    } else {
      console.log("✅ Proposal found.")
    }

    // Step 3: Load or Create RulesBank
    let rulesBank = await RulesBankModel.findOne()

    if (!rulesBank) {
      console.log("📭 RulesBank not found. Creating from demoRulesBank...")

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/updateRules`, {
        method: 'POST'
      })

      if (!res.ok) {
        console.error("❌ Failed to create RulesBank:", await res.text())
        return NextResponse.json({
          status: "error",
          message: "Failed to initialize rulesBank"
        }, { status: 500 })
      }

      rulesBank = await RulesBankModel.findOne()
      console.log("✅ RulesBank created and loaded.")
    } else {
      console.log("✅ RulesBank found.")
    }

// STEP 4: Determine section and rule index
const sections = ['information', 'assessment', 'responsePlan', 'review']
const currentSection = sections.find(s => !proposal.status[s]?.completed)
console.log(`user is in this stage =>`, currentSection);
if (!currentSection) {
  return NextResponse.json({
    response: "✅ All sections completed. You can now review and finalize your EOP.",
    session_id,
    status: 'done'
  })
}

const sectionRules = rulesBank[currentSection] || []
const lastRuleIndexAsked = proposal.status[currentSection].lastRuleIndexAsked ?? -1

// 🟢 If no rule has ever been asked, send the first one
if (lastRuleIndexAsked === -1) {
  proposal.status[currentSection].lastRuleIndexAsked = 0
  proposal.lastUpdated = new Date()
  await proposal.save()

  const firstRule = sectionRules[0]
  return NextResponse.json({
    response: `📌 ${firstRule.rule}`,
    session_id,
    status: 'success'
  })
}

const currentRule = sectionRules[lastRuleIndexAsked]
console.log(currentRule)
if (!currentRule) {
  console.error("❌ No rule found for index:", lastRuleIndexAsked)
  return NextResponse.json({
    error: "Internal rule sync error.",
    session_id,
    status: 'error'
  }, { status: 500 })
}

// 🤖 Thoughtful chatbot interaction before validation
const chatInteraction = await interactWithUser(currentRule, message)
// Optionally, you could send chatInteraction.prompt to the frontend for a more conversational experience

// ✅ Validate the user's response to the last asked question
const { valid, message: guidance } = await validateWithGuidance(currentRule.rule, message)

if (!valid) {
  return NextResponse.json({
    response: guidance,
    session_id,
    status: 'retry',
    chatPrompt: chatInteraction.prompt
  })
}

// ✅ Mark this rule as asked
sectionRules[lastRuleIndexAsked].asked = true
rulesBank.markModified(currentSection)
await rulesBank.save()

// 🔄 Advance to next rule
const nextIndex = lastRuleIndexAsked + 1
const nextRule = sectionRules[nextIndex]

if (!nextRule) {
  proposal.status[currentSection].completed = true
  proposal.status[currentSection].generatedText = `✅ Section "${currentSection}" completed.`
  proposal.status[currentSection].lastRuleIndexAsked = nextIndex
  proposal.lastUpdated = new Date()
  await proposal.save()

  return NextResponse.json({
    response: `✅ You've completed the "${currentSection}" section. Moving to the next section...`,
    session_id,
    status: 'section_completed'
  })
}

// 🔁 Ask next question
proposal.status[currentSection].lastRuleIndexAsked = nextIndex
proposal.lastUpdated = new Date()
await proposal.save()

return NextResponse.json({
  response: `📌 ${nextRule.rule}`,
  session_id,
  status: 'success'
})

  } catch (error) {
    console.error("❌ Error in /api/chat:", error)
    return NextResponse.json({ error: 'Failed at Step 2' }, { status: 500 })
  }
}
