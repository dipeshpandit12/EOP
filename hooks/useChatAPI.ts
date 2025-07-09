import { useState, useCallback } from 'react'

// Determine which API endpoint to use:
// In production (Vercel), use the proxy endpoint
// In development, use the direct API endpoint
const API_ENDPOINT = process.env.NODE_ENV === 'production' 
  ? '/api/proxy/chat'  // Use proxy in production to avoid CORS issues
  : '/api/chat';       // Use direct API route in development

interface ChatMessage {
  id?: string
  message: string
  role: 'user' | 'assistant'
  timestamp?: string
  [key: string]: unknown
}

interface ChatResponse {
  message?: string
  response?: string
  conversation_id?: string
  timestamp?: string
  [key: string]: unknown
}

export function useChatAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (messageData: string | Record<string, unknown>, conversationId?: string): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)

    // If messageData is a string, try to parse it as JSON, otherwise use it as a simple message
    let requestData: Record<string, unknown>
    if (typeof messageData === 'string') {
      try {
        // Try to parse as JSON first (for EOP chat messages)
        const parsed = JSON.parse(messageData)
        requestData = {
          ...parsed,
          session_id: conversationId, // FastAPI expects session_id, not conversation_id
          timestamp: new Date().toISOString()
        }
      } catch {
        // If parsing fails, treat as simple message
        requestData = {
          message: messageData,
          session_id: conversationId, // FastAPI expects session_id, not conversation_id
          timestamp: new Date().toISOString()
        }
      }
    } else {
      // If it's already an object, use it directly
      requestData = {
        ...messageData,
        session_id: conversationId, // FastAPI expects session_id, not conversation_id
        timestamp: new Date().toISOString()
      }
    }

    console.log('[useChatAPI] Sending request:', {
      url: API_ENDPOINT,
      method: 'POST',
      data: requestData,
      timestamp: new Date().toISOString()
    })

    try {
      const startTime = Date.now()
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const endTime = Date.now()
      
      console.log('[useChatAPI] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseTime: `${endTime - startTime}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString()
      })

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorDetail = errorData.error || errorDetail
          console.error('[useChatAPI] Error response body:', errorData)
        } catch (parseError) {
          console.error('[useChatAPI] Failed to parse error response:', parseError)
          // Try to get text response if JSON parsing fails
          try {
            const errorText = await response.text();
            errorDetail = errorText || errorDetail;
            console.error('[useChatAPI] Error response text:', errorText);
          } catch (textError) {
            console.error('[useChatAPI] Failed to get error response text:', textError);
          }
        }
        
        // Provide specific error messages based on status code
        if (response.status === 500) {
          setError(`Error: API responded with status: ${response.status}. Please check that the FastAPI server is running on port 8000.`);
          throw new Error(`Server error: The backend API returned a 500 Internal Server Error. Please check your server logs for more details.`);
        } else if (response.status === 404) {
          setError(`Error: API endpoint not found (404). Please check your backend API configuration.`);
          throw new Error(`Not found: The backend API endpoint was not found. Please check your server configuration.`);
        } else if (response.status === 403) {
          setError(`Error: Access forbidden (403). Please check your authentication.`);
          throw new Error(`Access forbidden: ${errorDetail}`);
        } else {
          setError(`Failed to send message: ${errorDetail}`);
          throw new Error(`Failed to send message: ${errorDetail}`);
        }
      }

      const result = await response.json()
      
      console.log('[useChatAPI] Success response:', {
        result,
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      
      // Add more specific error messages for common connection issues
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = "Network error: Unable to connect to the API. Please check that your FastAPI server is running and accessible."
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        errorMessage = "Request timed out: The API took too long to respond. Please check your server status."
      }
      
      console.error('[useChatAPI] Request failed:', {
        error: errorMessage,
        originalError: err,
        requestData,
        timestamp: new Date().toISOString()
      })
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getChatHistory = useCallback(async (conversationId?: string, limit?: number): Promise<ChatMessage[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (conversationId) params.append('conversation_id', conversationId)
      if (limit) params.append('limit', limit.toString())

      const response = await fetch(`/api/chat?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`)
      }

      const result = await response.json()
      return result.messages || result || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chat history'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const streamMessage = useCallback(async (
    message: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          stream: true,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to stream message: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6)
            if (chunk.trim() && onChunk) {
              onChunk(chunk)
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stream message'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    sendMessage,
    getChatHistory,
    streamMessage,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
