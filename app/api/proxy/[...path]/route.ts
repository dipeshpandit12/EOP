import { NextRequest, NextResponse } from 'next/server'

// Get the FastAPI URL from environment variables
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || 
                         process.env.FASTAPI_BASE_URL || 
                         'http://localhost:8000'

/**
 * Generic API route that proxies requests to the FastAPI backend
 * This allows the client to make requests to /api/proxy/[endpoint] which will be forwarded
 * to the FastAPI server at [FASTAPI_BASE_URL]/[endpoint]
 */
export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  try {
    const path = context.params.path?.join('/') || ''
    const url = new URL(request.url)
    const queryString = url.search
    const targetUrl = `${FASTAPI_BASE_URL}/${path}${queryString}`
    
    console.log(`[API Proxy] Forwarding GET request to: ${targetUrl}`)
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      // Add timeout using AbortController
      signal: AbortSignal.timeout(15000) // 15 second timeout
    })
    
    const data = await response.text()
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    })
  } catch (error) {
    console.error('[API Proxy] Error forwarding request:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  try {
    const path = context.params.path?.join('/') || ''
    const url = new URL(request.url)
    const queryString = url.search
    const targetUrl = `${FASTAPI_BASE_URL}/${path}${queryString}`
    
    console.log(`[API Proxy] Forwarding POST request to: ${targetUrl}`)
    
    const body = await request.json()
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body),
      // Add timeout using AbortController
      signal: AbortSignal.timeout(15000) // 15 second timeout
    })
    
    const data = await response.text()
    const contentType = response.headers.get('Content-Type') || 'application/json'
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType
      }
    })
  } catch (error) {
    console.error('[API Proxy] Error forwarding request:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}
