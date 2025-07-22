import { NextRequest, NextResponse } from 'next/server'
import {dbConnect} from '@/lib/db'
import ProposalModel from '@/models/proposal'
import RulesBankModel from '@/models/rulesBank'
import { generateGeminiResponse } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { session_id, message } = body;

    // Find or create proposal
    let proposal = await ProposalModel.findOne({ userId: session_id });
    if (!proposal) {
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
      });
    }

    // Load or create RulesBank
    let rulesBank = await RulesBankModel.findOne();
    if (!rulesBank) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/updateRules`, { method: 'POST' });
      rulesBank = await RulesBankModel.findOne();
    }

    // Determine current section
    const sections = ['information', 'assessment', 'responsePlan', 'review'];
    const currentSection = sections.find(s => !proposal.status[s]?.completed);

    if (!currentSection) {
      return NextResponse.json({
        response: "✅ All sections completed. You can now review and finalize your EOP.",
        session_id,
        status: 'done'
      });
    }

    // Gather context for Gemini
    const sectionKey = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
    const sectionRules: { rule: string }[] = rulesBank[sectionKey] || [];
    const lastRuleIndexAsked = proposal.status[currentSection].lastRuleIndexAsked ?? -1;
    const completedSections = sections.filter(s => proposal.status[s]?.completed);

    // Compose context for Gemini
    // Compose a prompt for Gemini
    const prompt = `
You are an expert assistant helping a user complete an Emergency Operations Plan (EOP).
Current section: ${currentSection}
Completed sections: ${completedSections.join(', ') || 'none'}
Relevant rules for this section:
${sectionRules.map((r, i) => `${i + 1}. ${r.rule}`).join('\n')}
Last rule index asked: ${lastRuleIndexAsked}
User's message: ${message}

Respond conversationally, guiding the user smoothly. If their answer is sufficient to complete the section, say so. If not, gently prompt for more info or clarification. If all rules are covered, indicate section completion.
`;

    const geminiText = await generateGeminiResponse(prompt);

    // Heuristic: if Gemini says section is complete, mark as complete
    if (/section (complete|completed|done)/i.test(geminiText)) {
      proposal.status[currentSection].completed = true;
      proposal.status[currentSection].generatedText = `✅ Section "${currentSection}" completed.`;
      proposal.status[currentSection].lastRuleIndexAsked = sectionRules.length;
      proposal.lastUpdated = new Date();
      await proposal.save();
      return NextResponse.json({
        response: geminiText,
        session_id,
        status: 'section_completed'
      });
    }

    return NextResponse.json({
      response: geminiText,
      session_id,
      status: 'success'
    });
  } catch (error) {
    console.error("❌ Error in /api/chat:", error);
    return NextResponse.json({ error: 'Failed at Step 2' }, { status: 500 });
  }
}