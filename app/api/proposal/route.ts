import { NextRequest, NextResponse } from 'next/server'
import ProposalModel from '@/models/proposal'
import { dbConnect } from '@/lib/db'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  const proposal = await ProposalModel.findOne({ userId: sessionId })
  if (!proposal) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  return NextResponse.json(proposal)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { session_id } = body;
  await dbConnect();

  let proposal = await ProposalModel.findOne({ userId: session_id })
  if (!proposal) {
    proposal = await ProposalModel.create({
      userId: session_id,
      status: {
        information: { completed: false, generatedText: null, responses: {} },
        assessment: { completed: false, generatedText: null, responses: {} },
        responsePlan: { completed: false, generatedText: null, responses: {} },
        review: { completed: false, finalGeneratedEOP: null }
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    })
  }

  return NextResponse.json(proposal)
}