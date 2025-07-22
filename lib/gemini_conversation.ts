import { generateGeminiResponse, validateWithGuidance } from './gemini'

export async function handleConversationResponse(rule: string, message: string): Promise<{ response: string, status: string }> {
  // Use Gemini to determine intent
  const intentPrompt = `
You are an AI helper. Your job is to classify the user's intent into two categories:

- "conversation": if the message sounds like a greeting, general comment, confusion, small talk, or casual response.
- "validation": if the message is a specific, serious, or relevant answer to a government form or rule.

Examples:
"Hi there" → conversation
"hello!" → conversation
"how are you?" → conversation
"my name is Diwas Pandit" → validation
"My plan includes all critical infrastructure." → validation

Now classify the following:
"${message}"

Reply with only one word: "conversation" or "validation".
`.trim();

  let intent: 'conversation' | 'validation' = 'validation';
  try {
    const intentResult = await generateGeminiResponse(intentPrompt);
    const normalized = intentResult.trim().toLowerCase();
    if (normalized === 'conversation') intent = 'conversation';
  } catch (e) {
    // fallback to validation
    console.log(e);
  }

  if (intent === 'conversation') {
    const prompt = `
You are a friendly assistant helping a user complete a government emergency operations form.

The user just sent a message that seems casual, like a greeting or off-topic remark:
"${message}"

The user is currently on this section of the form:
"${rule}"

Your job:
1. Acknowledge the user's tone in a warm and polite way (e.g., "Hi there! 👋")
2. Briefly explain that you're assisting with an official Emergency Operations Plan (EOP) form.
3. Gently guide them back to the current question or rule without sounding robotic.
4. Encourage them to give a response that aligns with the current topic.

Keep your tone human, calm, helpful, and brief. Do not repeat the user's message.

Example:
Hi there! 👋 I'm here to help you complete your Emergency Operations Plan. For this section — "${rule}" — feel free to share any info you have related to that. 😊

Now generate a response.
`.trim();

    const response = await generateGeminiResponse(prompt);
    return { response: response.trim(), status: 'casual' };
  }

  // Otherwise, validate
  const { valid, message: guidance } = await validateWithGuidance(rule, message);
  if (!valid) {
    return { response: guidance, status: 'retry' };
  }

  return { response: '', status: 'valid' };
}