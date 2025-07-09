import { NextRequest, NextResponse } from 'next/server'

// Use multiple sources for the FastAPI URL with proper fallbacks
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 
                        process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || 
                        'http://localhost:8000'

console.log('[Test API] Using FastAPI URL for chat test:', FASTAPI_BASE_URL)

export async function POST(request: NextRequest) {
  console.log('[Test API] Testing chat endpoint...')
  
  try {
    const body = await request.json()
    
    console.log('[Test API] Test chat request body:', body)
    
    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(`${FASTAPI_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: body.message || "Hello, test message",
        session_id: body.session_id || "test-session"
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))
    
    console.log('[Test API] Chat test response:', {
      status: response.status,
      ok: response.ok
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `FastAPI backend responded with status: ${response.status}`,
          details: await response.text()
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      status: 'success',
      backend: FASTAPI_BASE_URL,
      response: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Test API] Chat test failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = error instanceof DOMException && error.name === 'AbortError'
    
    return NextResponse.json(
      { 
        error: isTimeout 
          ? 'Connection timeout: The FastAPI backend did not respond in time.'
          : `Failed to connect to FastAPI backend: ${errorMessage}`,
        backend: FASTAPI_BASE_URL,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
