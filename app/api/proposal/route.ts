import { NextRequest, NextResponse } from 'next/server'

// Demo healthy structure for proposals
const healthyDemo = {
  proposals: [],
  lastUpdated: new Date().toISOString(),
  status: 'healthy',
  message: 'Demo stream success'
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const isStream = url.searchParams.get('stream') === 'true'

  if (isStream) {
    // Always send a healthy demo structure for demo success
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(`data: ${JSON.stringify(healthyDemo)}\n\n`)
        controller.close()
      }
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  }

  // Regular GET request for current proposal data
  return NextResponse.json(healthyDemo)
}
