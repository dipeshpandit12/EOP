// Helper for proposal introduction
export async function generateGeminiIntroduction(prompt: string): Promise<string> {
  return generateGeminiResponse(prompt);
}

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateGeminiResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini generation error:', error)
    return '⚠️ Sorry, I couldn’t generate a response at the moment.'
  }
}

export async function validateWithGuidance(rule: string, answer: string): Promise<{ valid: boolean, message: string }> {
  const prompt = `
You're validating a user's answer to a question on a government form.

Question: "${rule}"
User's Answer: "${answer}"

Your job is to:
1. Decide if the answer is appropriate and complete for this question.
2. If yes, say: VALID.
3. If not, respond like this:

"❗We’re expecting something like: [brief description or example]. Your answer might be incomplete or unclear. Could you please try again?"

Always reply with either "VALID" or the polite response.

EXAMPLES:
---
Q: "Organization name must be provided."
A: "Texas Rescue Center"
→ VALID

Q: "Organization name must be provided."
A: "idk"
→ ❗We’re expecting something like: the full legal name of your organization. Your answer might be incomplete or unclear. Could you please try again?

---
Now process:
Q: "${rule}"
A: "${answer}"
  `.trim()

  const result = await generateGeminiResponse(prompt)
  const clean = result.trim()

  if (clean.toLowerCase() === "valid") {
    return { valid: true, message: "" }
  }

  const wrappedMessage = `
🧐 Hmm, it looks like your response might be missing some details.

Here’s an example of what we’re looking for:
${clean}

Could you try rephrasing or adding more info? Let me know if you need help! 🙂
  `.trim()

  return { valid: false, message: wrappedMessage }
}


/**
 * Extracts the disaster type and incident date range from free‑form text.
 * If all fields are present, returns a normalised string like
 * "Flood, 2024-10-01 – 2024-10-31".  Otherwise returns nulls for the
 * missing fields and null for the normalised string.
 */export async function normalizeDisasterAnswer(answer: string) {
  const prompt = `
You are extracting information about a disaster from the following text:
"${answer}"

Identify:
- The disaster "type" (e.g. flood, hurricane, wildfire).  It may be phrased as "the event was flood", "this was a flood", etc.
- The date of the incident.  Dates may appear as "2023 Oct 04", "Oct 2024 03", "October 3, 2024", etc.  Recognise month names in any order and normalise to YYYY-MM-DD.
Return a JSON object **without any code fences** in this format:
  {
    "type": "<string or null>",
    "startDate": "<YYYY-MM-DD or null>",
    "normalized": "<'Type, YYYY-MM-DD' if both type and startDate are present, otherwise null>"
  }`.trim();

  const raw = await generateGeminiResponse(prompt);
  let jsonText = raw.trim();
  if (jsonText.startsWith('```')) {
  jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  }
  try {
    const parsed = JSON.parse(jsonText);
    const { type = null, startDate = null, normalized = null } = parsed;
    return { type, startDate, normalized };
  } catch (e) {
    console.log(e);
    console.error('Could not parse Gemini extraction result:', raw);
    return { type: null, startDate: null, normalized: null };
  }
}