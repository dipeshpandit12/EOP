import { NextRequest } from 'next/server';

// Get the FastAPI URL from environment variables
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || 
                         process.env.FASTAPI_BASE_URL || 
                         'http://localhost:8000';

// Alternative approach using a single handler for all HTTP methods
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, 'DELETE');
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, 'PATCH');
}

/**
 * Generic handler for all HTTP methods
 */
async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    const targetUrl = `${FASTAPI_BASE_URL}/${path}${queryString}`;
    
    console.log(`[API Proxy] Forwarding ${method} request to: ${targetUrl}`);
    
    // Prepare headers to forward
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };
    
    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method) && request.body) {
      try {
        const body = await request.json();
        options.body = JSON.stringify(body);
      } catch (error) {
        console.error('[API Proxy] Error parsing request body:', error);
      }
    }
    
    // Make the request to the target API
    const response = await fetch(targetUrl, options).finally(() => clearTimeout(timeoutId));
    
    // Get the response data
    const data = await response.text();
    const contentType = response.headers.get('Content-Type') || 'application/json';
    
    // Return the response
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error forwarding request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';
    
    const errorResponse = {
      error: isTimeout 
        ? 'Connection timeout: The backend did not respond in time.'
        : `Failed to connect to backend: ${errorMessage}`,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
