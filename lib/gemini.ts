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
