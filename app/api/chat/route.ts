
import { NextRequest, NextResponse } from 'next/server'
import RulesBankModel from '@/models/rulesBank';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, message } = body;
    // Ensure rulesBank exists in the database
    let rulesBank = await RulesBankModel.findOne();
    if (!rulesBank) {
      // Call updateRules endpoint to create it
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/updateRules`, { method: 'POST' });
      rulesBank = await RulesBankModel.findOne();
    }

    // Demo: echo back a canned response
    const botReply = `You said: "${message}". (This is a demo response from the EOP Assistant bot.)`;

    return NextResponse.json({
      response: botReply,
      session_id: session_id || 'demo-session',
      status: 'success',
      message: 'Demo chat response generated.',
      rulesBank: rulesBank || null
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      response: '',
      status: 'error',
      message: 'Failed to process chat request.'
    }, { status: 400 });
  }
}