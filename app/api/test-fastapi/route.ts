import { NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    console.log('[FastAPI Test] Testing direct FastAPI connection...')
    
    // Test 1: Health check
    const healthResponse = await fetch(`${FASTAPI_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log('[FastAPI Test] Health check response:', {
      status: healthResponse.status,
      ok: healthResponse.ok
    })
    
    const healthData = healthResponse.ok ? await healthResponse.json() : null
    
    // Test 2: Chat endpoint capabilities
    const chatTestResponse = await fetch(`${FASTAPI_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Hello, this is a test message to check if AI is working",
        session_id: "test-session-123",
        timestamp: new Date().toISOString()
      })
    })
    
    console.log('[FastAPI Test] Chat test response:', {
      status: chatTestResponse.status,
      ok: chatTestResponse.ok
    })
    
    const chatData = chatTestResponse.ok ? await chatTestResponse.json() : null
    
    // Test 3: Check available endpoints
    const docsResponse = await fetch(`${FASTAPI_BASE_URL}/docs`, {
      method: 'GET'
    })
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      fastApiUrl: FASTAPI_BASE_URL,
      tests: {
        health: {
          status: healthResponse.status,
          ok: healthResponse.ok,
          data: healthData
        },
        chat: {
          status: chatTestResponse.status,
          ok: chatTestResponse.ok,
          data: chatData
        },
        docs: {
          status: docsResponse.status,
          ok: docsResponse.ok,
          available: docsResponse.ok
        }
      }
    })
    
  } catch (error) {
    console.error('[FastAPI Test] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      fastApiUrl: FASTAPI_BASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
