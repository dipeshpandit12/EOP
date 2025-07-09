# FEMA EOP API Documentation

This document describes the two API endpoints created for the Emergency EOP application that integrate with your FastAPI backend implementing the Model Context Protocol (MCP) for FEMA Emergency Operations Planning.

## 1. Chat API (`/api/chat`)

The chat API serves as a proxy to communicate with your FastAPI backend that implements a sophisticated two-pass MCP system designed specifically for FEMA Emergency Operations Planning (EOP) proposal collection.

### System Architecture

When a user sends a message, the system:
1. **First Pass**: Uses a context identification model (Gemini-1.5-flash) to analyze conversation history and extract structured data from user input
2. **Second Pass**: Uses another Gemini model configured as an EOP assistant to generate contextually-aware responses
3. **Database Integration**: Automatically updates MongoDB with extracted proposal information
4. **Session Management**: Maintains conversation continuity through persistent session tracking

### Endpoints

#### POST `/api/chat`
Send a message to the FastAPI MCP backend.

**Request Body:**
```json
{
  "message": "We are the Seminole Nation of Oklahoma, located in southeastern Oklahoma...",
  "sessionId": "session-12345",
  "proposalId": "proposal-67890",
  "extractedData": {
    "tribalNationInfo": {
      "name": "Seminole Nation of Oklahoma",
      "location": "southeastern Oklahoma"
    }
  }
}
```

**Response:**
```json
{
  "response": "Thank you for providing that information about the Seminole Nation of Oklahoma. Can you tell me about the current emergency management structure in your tribal government?",
  "nextQuestion": "What is your current emergency management organizational structure?",
  "extractedData": {
    "tribalNationInfo": {
      "name": "Seminole Nation of Oklahoma",
      "location": "southeastern Oklahoma"
    }
  },
  "proposalUpdated": true,
  "completionPercentage": 15,
  "sessionId": "session-12345",
  "proposalId": "proposal-67890"
}
```

#### GET `/api/chat`
Retrieve chat history from the FastAPI backend.

**Query Parameters:**
- `sessionId` (optional): Filter by session ID
- `proposalId` (optional): Filter by proposal ID
- `limit` (optional): Limit number of messages returned

### Usage Example

```typescript
import { useEOPChat } from '@/hooks/useEOPChat'

function ChatComponent() {
  const { 
    sendEOPMessage, 
    chatHistory, 
    getCurrentProposal,
    getProposalProgress,
    isLoading 
  } = useEOPChat()
  
  const handleSend = async () => {
    try {
      const response = await sendEOPMessage("We need help with flood preparedness planning")
      console.log(`Progress: ${response.completionPercentage}%`)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }
  
  return (
    // Your chat UI here
  )
}
```

## 2. Proposal Interface API (`/api/proposal`)

The proposal API manages FEMA EOP proposal data by communicating with your FastAPI backend while providing real-time updates using Server-Sent Events (SSE) for the frontend.

### FEMA EOP Data Structure

The system tracks comprehensive proposal data across 15+ structured fields:

```typescript
interface Proposal {
  id: string
  sessionId?: string
  tribalNationInfo?: {
    name?: string
    location?: string
    population?: number
    governmentStructure?: string
    contactInfo?: {
      emergencyCoordinator?: string
      phone?: string
      email?: string
    }
  }
  hazardAssessments?: Array<{
    hazardType?: string
    riskLevel?: 'low' | 'moderate' | 'high' | 'extreme'
    probability?: string
    potentialImpact?: string
    vulnerabilities?: string[]
    mitigationMeasures?: string[]
  }>
  emergencyResponse?: {
    procedures?: string[]
    resourceRequirements?: string[]
    coordinationProtocols?: string[]
    communicationPlan?: string
    evacuationProcedures?: string
  }
  status?: 'draft' | 'in_progress' | 'review' | 'submitted' | 'approved'
  completionPercentage?: number
  lastQuestionAnswered?: string
  nextQuestion?: string
  supportingDocuments?: string[]
  createdAt?: string
  updatedAt?: string
}
```

### Endpoints

#### GET `/api/proposal`
Retrieve current proposal data from FastAPI backend.

**Response:**
```json
{
  "proposals": [
    {
      "id": "proposal-67890",
      "sessionId": "session-12345",
      "tribalNationInfo": {
        "name": "Seminole Nation of Oklahoma",
        "location": "southeastern Oklahoma",
        "population": 18000
      },
      "status": "in_progress",
      "completionPercentage": 35,
      "nextQuestion": "What are the primary natural hazards that affect your tribal lands?"
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/api/proposal?stream=true`
Establish a Server-Sent Events connection for real-time updates.

#### POST `/api/proposal`
Create or update proposal data (forwards to FastAPI `/proposals` endpoint).

#### PUT `/api/proposal`
Update a specific proposal by ID (forwards to FastAPI `/proposals/{id}` endpoint).

#### DELETE `/api/proposal?id=proposal-1`
Delete a specific proposal (forwards to FastAPI `/proposals/{id}` endpoint).

### Usage Example

```typescript
import { useEOPChat } from '@/hooks/useEOPChat'

function ProposalComponent() {
  const { 
    getCurrentProposal,
    getProposalProgress,
    allProposals,
    proposalConnected
  } = useEOPChat()
  
  const currentProposal = getCurrentProposal()
  const progress = getProposalProgress()
  
  return (
    <div>
      <div>Connected: {proposalConnected ? 'Yes' : 'No'}</div>
      <div>Progress: {progress}%</div>
      <div>Proposals: {allProposals.length}</div>
      {currentProposal?.tribalNationInfo?.name && (
        <div>Nation: {currentProposal.tribalNationInfo.name}</div>
      )}
    </div>
  )
}
```

## Environment Configuration

Create a `.env.local` file in your project root:

```env
FASTAPI_BASE_URL=http://localhost:8000
```

## FastAPI Backend Requirements

Your FastAPI backend should expose the following endpoints:

### Chat Endpoints
- **POST `/chat`** - Handle MCP chat messages and return contextual responses
- **GET `/chat`** - Return chat history with optional filtering

### Proposal Endpoints  
- **GET `/proposals`** - Return all proposals with structured EOP data
- **POST `/proposals`** - Create new proposal
- **PUT `/proposals/{id}`** - Update existing proposal
- **DELETE `/proposals/{id}`** - Delete proposal

### Expected FastAPI Response Format

The FastAPI backend should return responses in this format for chat:

```json
{
  "response": "AI assistant response guiding through EOP creation",
  "nextQuestion": "What would you like to work on next?",
  "extractedData": {
    "tribalNationInfo": { /* extracted data */ },
    "hazardAssessments": [ /* extracted hazards */ ],
    "emergencyResponse": { /* extracted response data */ }
  },
  "proposalUpdated": true,
  "completionPercentage": 45,
  "sessionId": "session-id",
  "proposalId": "proposal-id"
}
```

## Real-time Updates

The proposal API maintains real-time synchronization between:
- **Frontend**: Next.js application with SSE connections
- **Backend**: FastAPI with MongoDB for persistent storage
- **Chat System**: MCP-enabled conversational interface

When users interact with the chat interface, the system:
1. Extracts structured EOP data automatically
2. Updates the database through FastAPI
3. Broadcasts changes to all connected clients via SSE
4. Maintains session continuity and progress tracking

## Error Handling

Both APIs include comprehensive error handling:
- FastAPI communication errors are caught and logged
- Network timeouts fall back to cached data where possible
- Client-side hooks provide error states for UI handling
- Invalid requests return appropriate HTTP status codes

## Testing

Use the `APITestComponent` to test the integrated system:

```typescript
import { APITestComponent } from '@/components/api-test-component'

export default function TestPage() {
  return <APITestComponent />
}
```

This component provides a comprehensive interface to test the FEMA EOP chat system with real-time proposal updates and progress tracking.
