import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const requestStart = Date.now()
  
  try {
    console.log('[Chat API] Incoming POST request:', {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    })
    
    const body = await request.json()
    
    console.log('[Chat API] Request body parsed:', {
      bodyKeys: Object.keys(body),
      fullBody: body, // Log the complete body to see what FastAPI is receiving
      message: body.message ? `"${body.message.toString().substring(0, 100)}..."` : 'undefined',
      sessionId: body.session_id || body.sessionId, // Check both field names
      timestamp: new Date().toISOString()
    })
    
    // Forward the request to FastAPI backend
    const fastApiStart = Date.now()
    const response = await fetch(`${FASTAPI_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authentication headers if needed
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body)
    })

    const fastApiEnd = Date.now()
    
    console.log('[Chat API] FastAPI response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      fastApiResponseTime: `${fastApiEnd - fastApiStart}ms`,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString()
    })

    if (!response.ok) {
      let errorDetail = `FastAPI responded with status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Validation errors from FastAPI
            errorDetail = errorData.detail.map((err: Record<string, unknown>) => 
              `${(err.loc as string[])?.join?.('.') || 'Field'}: ${err.msg || err.type}`
            ).join(', ')
          } else {
            errorDetail = errorData.detail
          }
        } else if (errorData.error) {
          errorDetail = errorData.error
        }
        console.error('[Chat API] FastAPI error response:', errorData)
      } catch (parseError) {
        console.error('[Chat API] Failed to parse FastAPI error response:', parseError)
      }
      throw new Error(errorDetail)
    }

    const data = await response.json()
    
    const totalTime = Date.now() - requestStart
    console.log('[Chat API] Request completed successfully:', {
      totalResponseTime: `${totalTime}ms`,
      dataKeys: Object.keys(data),
      fullResponse: data, // Log the complete response from FastAPI
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(data)
  } catch (error) {
    const totalTime = Date.now() - requestStart
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    console.error('[Chat API] Request failed:', {
      error: errorMessage,
      originalError: error,
      totalTime: `${totalTime}ms`,
      fastApiUrl: `${FASTAPI_BASE_URL}/chat`,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        debug: {
          fastApiUrl: `${FASTAPI_BASE_URL}/chat`,
          totalTime: `${totalTime}ms`
        }
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    // If no parameters provided, this is likely a connection test from dashboard
    if (searchParams.toString() === '') {
      // Return a simple health check response instead of hitting FastAPI
      return NextResponse.json({ 
        status: 'connected',
        message: 'Chat API is available',
        timestamp: new Date().toISOString()
      })
    }
    
    // Forward GET request to FastAPI with parameters (e.g., for chat history)
    const response = await fetch(`${FASTAPI_BASE_URL}/chat?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      }
    })

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat data' },
      { status: 500 }
    )
  }
}
