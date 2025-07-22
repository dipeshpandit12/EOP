import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, message } = body

    // Demo: echo back a canned response
    const botReply = `You said: "${message}". (This is a demo response from the EOP Assistant bot.)`

    return NextResponse.json({
      response: botReply,
      session_id: session_id || 'demo-session',
      status: 'success',
      message: 'Demo chat response generated.'
    })
  } catch (error) {
    return NextResponse.json({
      response: '',
      status: 'error',
      message: 'Failed to process chat request.'
    }, { status: 400 })
    console.log(error);
  }
}
