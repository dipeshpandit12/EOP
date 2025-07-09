# EOP Chat Data Flow Analysis

## Overview
This document outlines the complete data flow when a user enters data in the chatbot input box, including error handling and debugging points.

## Data Flow Diagram

```
User Input → Next.js Frontend → Next.js API → FastAPI Backend → Response Chain
    ↓              ↓               ↓             ↓               ↓
[Input Box]   [useEOPChat]   [/api/chat]   [FastAPI/chat]   [Update UI]
    ↓              ↓               ↓             ↓               ↓
[Validation]  [Error Handle]  [Proxy/Cache]  [AI Process]   [Real-time]
```

## Detailed Step-by-Step Flow

### 1. User Input Stage
**Location**: `app/page.tsx` - Input textarea
```
User types message → handleSendMessage() triggered → Validation
```
**Potential Issues**:
- Empty message validation
- Loading state conflicts
- Connection status checks

### 2. Frontend Hook Processing
**Location**: `hooks/useEOPChat.ts` - sendEOPMessage()
```
Message received → Session/Proposal ID handling → API call preparation
```
**Key Operations**:
- Session ID management
- Proposal ID resolution
- Message history tracking
- Error state management

### 3. Next.js API Layer
**Location**: `app/api/chat/route.ts`
```
POST request → Body validation → FastAPI forwarding → Response handling
```
**Error Points**:
- JSON parsing failures
- FastAPI connection issues
- Response format validation
- Timeout handling

### 4. FastAPI Backend
**Location**: External FastAPI server (localhost:8000)
```
Request received → AI processing → Data extraction → Response generation
```
**Common Issues**:
- Server offline (Connection refused)
- Invalid request format (422 errors)
- Processing timeouts
- AI model failures

### 5. Response Chain Back
```
FastAPI response → Next.js API processing → Hook updates → UI refresh
```
**Update Mechanisms**:
- Direct response handling
- SSE real-time updates
- Proposal data synchronization
- Chat history updates

## Error Handling Points

### Frontend Validation (app/page.tsx)
```typescript
const handleSendMessage = async () => {
  // Point 1: Input validation
  if (!message.trim() || isLoading) return
  
  try {
    // Point 2: Hook execution
    await sendEOPMessage(message)
    setMessage("")
  } catch (error) {
    // Point 3: Error display
    console.error("Failed to send message:", error)
  }
}
```

### Hook Error Management (hooks/useEOPChat.ts)
```typescript
const sendEOPMessage = useCallback(async (...) => {
  try {
    // Point 4: Session management
    const sessionId = options?.forceNewSession ? ...
    
    // Point 5: Proposal data preparation
    extractedData: Array.isArray(proposalData.proposals) ? ...
    
    // Point 6: API call
    const response = await sendMessage(...)
    
    // Point 7: Response parsing
    const eopResponse: EOPChatResponse = typeof response === 'string' ? 
      JSON.parse(response) : response
      
  } catch (error) {
    // Point 8: Hook error handling
    console.error('EOP Chat error:', error)
    throw error
  }
}, [...])
```

### API Layer Error Handling (app/api/chat/route.ts)
```typescript
export async function POST(request: NextRequest) {
  try {
    // Point 9: Request parsing
    const body = await request.json()
    
    // Point 10: FastAPI communication
    const response = await fetch(`${FASTAPI_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    // Point 11: Response validation
    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`)
    }

    // Point 12: Data return
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    // Point 13: API error response
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to communicate with chat service' },
      { status: 500 }
    )
  }
}
```

## Connection Status Monitoring

### Real-time Connection Tracking
1. **API Connection**: Tests `/api/proposal` every 30 seconds
2. **FastAPI Direct**: Dashboard tests `localhost:8000` directly
3. **SSE Connection**: Real-time updates via Server-Sent Events
4. **Proposal Sync**: Automatic data synchronization

### Connection States
- `checking`: Initial or testing state
- `connected`: All systems operational
- `disconnected`: Service unavailable

## Common Error Scenarios

### 1. FastAPI Server Offline
**Symptoms**: 
- Connection refused errors
- API status shows "Disconnected"
- Chat messages fail with 500 errors

**Debug Steps**:
1. Check if FastAPI server is running on localhost:8000
2. Verify server logs for startup errors
3. Test direct curl to FastAPI endpoints

### 2. Invalid Request Format
**Symptoms**:
- 422 Unprocessable Entity errors
- FastAPI rejects the request
- Specific field validation failures

**Debug Steps**:
1. Check request body structure in browser DevTools
2. Verify FastAPI expected schema
3. Test with minimal valid payload

### 3. Session/Proposal ID Issues
**Symptoms**:
- Chat context lost
- Proposal data not updating
- Session conflicts

**Debug Steps**:
1. Check browser localStorage for session data
2. Verify session ID generation logic
3. Monitor proposal ID consistency

### 4. Real-time Update Failures
**Symptoms**:
- SSE connection shows disconnected
- Proposal updates not reflected in UI
- Manual refresh required

**Debug Steps**:
1. Check SSE connection in Network tab
2. Verify EventSource implementation
3. Test proposal cache synchronization

## Debugging Tools

### Browser DevTools
- **Network Tab**: Monitor API calls and responses
- **Console**: Check error messages and logs
- **Application Tab**: Inspect localStorage and session data

### Server Logs
- **Next.js Console**: API route errors and debugging
- **FastAPI Logs**: Backend processing and AI responses

### Real-time Monitoring
- **Connection Status**: UI badges show live status
- **Chat History**: Complete message flow tracking
- **Proposal Progress**: Data extraction monitoring

## Performance Considerations

### Timeout Settings
- FastAPI requests: 30 second default
- Connection tests: 5 second timeout
- SSE reconnection: 3 second delay

### Caching Strategy
- Proposal data cached in Next.js API
- Chat history stored in component state
- Session persistence across page reloads

### Error Recovery
- Automatic reconnection for SSE
- Retry logic for failed API calls
- Graceful degradation when offline
