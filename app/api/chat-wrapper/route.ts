import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ProposalModel from '@/models/proposal';
import RulesBankModel from '@/models/rulesBank';
import { generateGeminiResponse, validateWithGuidance, normalizeDisasterAnswer } from '@/lib/gemini';

/**
 * In-memory storage for partial answers.  This store holds the parts of a user's
 * response to a particular rule until Gemini determines the answer is complete.
 * The structure is a nested object keyed by session ID, then by section name,
 * then by rule index.  For production use you may want to persist this state
 * in your database or cache layer instead of keeping it in memory.
 */
interface PartialAnswers {
  [sessionId: string]: {
    [section: string]: {
      [ruleIndex: number]: string;
    };
  };
}

const sessionPartialAnswers: PartialAnswers = {};

/**
 * Simple intent detection heuristic.  If the user input appears to be a casual
 * conversational question and does not mention any keywords from the current
 * rule, return true.  You can replace this with a more sophisticated model
 * (e.g. a Gemini classification call) if needed.
 *
 * @param rule   The text of the current rule being asked.
 * @param message The user's message.
 */
function isLikelyGeneralChat(rule: string, message: string): boolean {
  const msg = message.trim().toLowerCase();
  // Common chat phrases or question words
  const chatTriggers = ['how are you', 'how are things', 'what\'s up', 'thank you', 'thanks'];
  if (chatTriggers.some(trigger => msg.includes(trigger))) {
    return true;
  }
  // If the message ends with a question mark and contains "you", assume it's chat
  if (msg.endsWith('?') && msg.includes('you')) {
    return true;
  }
  // Basic keyword overlap: split rule into words and see if any appear in the message
  const ruleKeywords = rule.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const messageWords = msg.split(/[^a-z0-9]+/).filter(Boolean);
  const overlap = ruleKeywords.some(kw => messageWords.includes(kw));
  return !overlap;
}

/**
 * Main POST handler for the chat wrapper.  This endpoint orchestrates the
 * conversation flow for the Emergency Operations Plan assistant.  It tracks
 * where a user is in the questionnaire, validates answers using Gemini, and
 * supports casual conversation by answering general questions and gently
 * reminding the user of the current task.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, message } = body;

  if (!session_id || !message) {
    return NextResponse.json({ error: 'Missing session_id or message' }, { status: 400 });
  }

  // Ensure a database connection before interacting with models
  await dbConnect();

  // Retrieve or initialise the user's proposal document
  let proposal = await ProposalModel.findOne({ userId: session_id });
  if (!proposal) {
    proposal = await ProposalModel.create({
      userId: session_id,
      status: {
        information: { completed: false, generatedText: null, lastRuleIndexAsked: -1, responses: [], keyInfo: null },
        assessment: { completed: false, generatedText: null, lastRuleIndexAsked: -1, responses: [], keyInfo: null },
        responsePlan: { completed: false, generatedText: null, lastRuleIndexAsked: -1, responses: [], keyInfo: null },
        review: { completed: false, finalGeneratedEOP: null }
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    });
  }

  // Load the rules bank.  If missing, return an error; it should be created via /api/updateRules.
  const rulesBank = await RulesBankModel.findOne();
  if (!rulesBank) {
    return NextResponse.json({ error: 'Rules bank not initialised' }, { status: 500 });
  }

  // Determine which section is currently incomplete
  const sections = ['information', 'assessment', 'responsePlan', 'review'] as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentSection = sections.find(s => !(proposal.status as any)[s].completed);

  // If all sections are complete or we are in the review section, handle as a normal chat
  if (!currentSection || currentSection === 'review') {
    const chatReply = await generateGeminiResponse(message);
    return NextResponse.json({ response: chatReply, session_id, status: 'chat' });
  }

  // Access the section data and its list of rules
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionData = (proposal.status as any)[currentSection];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionRules = (rulesBank as any)[currentSection] || [];
  let ruleIndex = sectionData.lastRuleIndexAsked ?? -1;

  // If no rule has been asked yet, send the first rule prompt
  if (ruleIndex === -1) {
    ruleIndex = 0;
    sectionData.lastRuleIndexAsked = ruleIndex;
    proposal.lastUpdated = new Date();
    await proposal.save();
    const firstRule = sectionRules[ruleIndex];
    return NextResponse.json({ response: `📌 ${firstRule.rule}`, session_id, status: 'prompt' });
  }

  const currentRule = sectionRules[ruleIndex];
  if (!currentRule) {
    return NextResponse.json({ error: 'No rule found for current index' }, { status: 500 });
  }

  // Combine any previously stored partial answer with the new message
  const partial = sessionPartialAnswers[session_id]?.[currentSection]?.[ruleIndex] || '';
  const combinedAnswer = `${partial} ${message}`.trim();

  /*
   * Special handling for the "type of disaster" question: attempt to normalise
   * the answer before any general chat detection.  If the current rule asks
   * about the type of disaster and the incident date, we parse the user’s
   * combined answer using normalizeDisasterAnswer.  If a valid type and date
   * are extracted, we treat the response as complete without performing
   * generic chat detection.  This prevents legitimate answers such as
   * "flood, Monday Sep 03, 2024" from being misclassified as chat by
   * our simple keyword heuristic.
   */
  if (currentRule.rule.toLowerCase().includes('type of disaster')) {
    const { type, startDate, normalized } = await normalizeDisasterAnswer(combinedAnswer);
    if (normalized) {
      // Clear any partial answer and save the normalised response
      if (sessionPartialAnswers[session_id]?.[currentSection]?.[ruleIndex]) {
        delete sessionPartialAnswers[session_id][currentSection][ruleIndex];
      }
      sectionData.responses = sectionData.responses || [];
      sectionData.responses[ruleIndex] = normalized;
      sectionData.keyInfo = normalized.length > 200 ? normalized.slice(0, 200) + '...' : normalized;
      currentRule.asked = true;
      sectionData.lastRuleIndexAsked = ruleIndex;
      // Determine the next rule index
      const nextIndex = ruleIndex + 1;
      const nextRule = sectionRules[nextIndex];
      if (!nextRule) {
        sectionData.completed = true;
        sectionData.generatedText = `✅ Section "${currentSection}" completed.`;
        sectionData.lastRuleIndexAsked = nextIndex;
        proposal.lastUpdated = new Date();
        await proposal.save();
        return NextResponse.json({
          response: `✅ You’ve completed the "${currentSection}" section. Moving to the next section...`,
          session_id,
          status: 'section_completed'
        });
      }
      sectionData.lastRuleIndexAsked = nextIndex;
      proposal.lastUpdated = new Date();
      await proposal.save();
      return NextResponse.json({ response: `📌 ${nextRule.rule}`, session_id, status: 'prompt' });
    }
    // If type and date are present but no normalised string, construct our own final answer
    if (type && startDate) {
      const finalAnswer = `${type}, ${startDate}`;
      if (sessionPartialAnswers[session_id]?.[currentSection]?.[ruleIndex]) {
        delete sessionPartialAnswers[session_id][currentSection][ruleIndex];
      }
      sectionData.responses = sectionData.responses || [];
      sectionData.responses[ruleIndex] = finalAnswer;
      sectionData.keyInfo = finalAnswer.length > 200 ? finalAnswer.slice(0, 200) + '...' : finalAnswer;
      currentRule.asked = true;
      sectionData.lastRuleIndexAsked = ruleIndex;
      const nextIndex = ruleIndex + 1;
      const nextRule = sectionRules[nextIndex];
      if (!nextRule) {
        sectionData.completed = true;
        sectionData.generatedText = `✅ Section "${currentSection}" completed.`;
        sectionData.lastRuleIndexAsked = nextIndex;
        proposal.lastUpdated = new Date();
        await proposal.save();
        return NextResponse.json({
          response: `✅ You’ve completed the "${currentSection}" section. Moving to the next section...`,
          session_id,
          status: 'section_completed'
        });
      }
      sectionData.lastRuleIndexAsked = nextIndex;
      proposal.lastUpdated = new Date();
      await proposal.save();
      return NextResponse.json({ response: `📌 ${nextRule.rule}`, session_id, status: 'prompt' });
    }
    // Otherwise ask for the missing pieces (we do not ask for an end date)
    const missing: string[] = [];
    if (!type) missing.push('type of disaster');
    if (!startDate) missing.push('date of the incident');
    sessionPartialAnswers[session_id] = sessionPartialAnswers[session_id] || {};
    sessionPartialAnswers[session_id][currentSection] = sessionPartialAnswers[session_id][currentSection] || {};
    sessionPartialAnswers[session_id][currentSection][ruleIndex] = combinedAnswer;
    return NextResponse.json({
      response: `I see part of your answer, but I’m missing the ${missing.join(' and ')}. Could you provide that?`,
      session_id,
      status: 'retry'
    });
  }

  // Detect if the user is engaging in general chat rather than answering the question.
  // This check is skipped for the "type of disaster" rule, which is handled above.
  if (isLikelyGeneralChat(currentRule.rule, message)) {
    const chatPrompt = `
You are a friendly emergency operations plan assistant.  A user just said:
"${message}"

1. Respond to their question naturally (for example, "I’m doing well, thanks for asking!").
2. Gently remind them that we are still gathering information for their Emergency Operations Plan and repeat the current question: "${currentRule.rule}".

Respond in one or two friendly sentences.
    `.trim();
    const chatResponse = await generateGeminiResponse(chatPrompt);
    return NextResponse.json({ response: chatResponse, session_id, status: 'chat' });
  }


  // Ask Gemini to validate the combined answer.  It will return 'VALID' or a polite guidance message【734508196370771†L21-L70】.
  const { valid, message: guidance } = await validateWithGuidance(currentRule.rule, combinedAnswer);

  // If the answer is not valid, store the combined text and return guidance
  if (!valid) {
    sessionPartialAnswers[session_id] = sessionPartialAnswers[session_id] || {};
    sessionPartialAnswers[session_id][currentSection] = sessionPartialAnswers[session_id][currentSection] || {};
    sessionPartialAnswers[session_id][currentSection][ruleIndex] = combinedAnswer;
    return NextResponse.json({ response: guidance, session_id, status: 'retry' });
  }

  // Valid answer: clear any stored partial answer and save the response
  if (sessionPartialAnswers[session_id]?.[currentSection]?.[ruleIndex]) {
    delete sessionPartialAnswers[session_id][currentSection][ruleIndex];
  }
  sectionData.responses = sectionData.responses || [];
  sectionData.responses[ruleIndex] = combinedAnswer;
  // Save a short summary of the answer in keyInfo (up to 200 chars)
  sectionData.keyInfo = combinedAnswer.length > 200 ? combinedAnswer.slice(0, 200) + '...' : combinedAnswer;
  // Mark the rule as asked
  currentRule.asked = true;
  sectionData.lastRuleIndexAsked = ruleIndex;

  // Determine the next rule index
  const nextIndex = ruleIndex + 1;
  const nextRule = sectionRules[nextIndex];

  // If there is no next rule, complete the current section
  if (!nextRule) {
    sectionData.completed = true;
    sectionData.generatedText = `✅ Section "${currentSection}" completed.`;
    sectionData.lastRuleIndexAsked = nextIndex;
    proposal.lastUpdated = new Date();
    await proposal.save();
    return NextResponse.json({
      response: `✅ You’ve completed the "${currentSection}" section. Moving to the next section...`,
      session_id,
      status: 'section_completed'
    });
  }

  // Otherwise, advance to the next rule and prompt the user
  sectionData.lastRuleIndexAsked = nextIndex;
  proposal.lastUpdated = new Date();
  await proposal.save();
  return NextResponse.json({ response: `📌 ${nextRule.rule}`, session_id, status: 'prompt' });
}