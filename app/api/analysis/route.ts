// app/api/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { validateWithGuidance } from '@/lib/gemini'
import { handleConversationResponse } from '@/lib/gemini_conversation'
import { generateGeminiResponse } from '@/lib/gemini'

// Determine intent using Gemini itself
async function determineIntent(answer: string): Promise<'validation' | 'conversation'> {
const prompt = `
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
"${answer}"

Reply with only one word: "conversation" or "validation".
`.trim()


  try {
    const response = await generateGeminiResponse(prompt)
    const normalized = response.trim().toLowerCase()
    return normalized === 'conversation' ? 'conversation' : 'validation'
  } catch (error) {
    console.error('❌ Failed to determine intent, defaulting to validation:', error)
    return 'validation'
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rule, answer } = await req.json()

    const intent = await determineIntent(answer)

    if (intent === 'conversation') {
      const message = await handleConversationResponse(rule, answer)
      return NextResponse.json({ type: 'conversation', message })
    }

    const result = await validateWithGuidance(rule, answer)
    return NextResponse.json({ type: 'validation', ...result })

  } catch (err) {
    console.error('❌ Analysis API error:', err)
    return NextResponse.json({ valid: false, message: 'Error processing input.' }, { status: 500 })
  }
}
