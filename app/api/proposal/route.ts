import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

// Type definitions for FEMA EOP Proposal structure
interface TribalNationInfo {
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

interface HazardAssessment {
  hazardType?: string
  riskLevel?: 'low' | 'moderate' | 'high' | 'extreme'
  probability?: string
  potentialImpact?: string
  vulnerabilities?: string[]
  mitigationMeasures?: string[]
}

interface EmergencyResponse {
  procedures?: string[]
  resourceRequirements?: string[]
  coordinationProtocols?: string[]
  communicationPlan?: string
  evacuationProcedures?: string
}

interface Proposal {
  id: string
  sessionId?: string
  tribalNationInfo?: TribalNationInfo
  hazardAssessments?: HazardAssessment[]
  emergencyResponse?: EmergencyResponse
  status?: 'draft' | 'in_progress' | 'review' | 'submitted' | 'approved'
  completionPercentage?: number
  lastQuestionAnswered?: string
  nextQuestion?: string
  supportingDocuments?: string[]
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

interface ProposalData {
  proposals: Proposal[]
  lastUpdated: string | null
  [key: string]: unknown
}

// Cache for proposal data (synced with FastAPI backend)
let proposalCache: ProposalData = {
  proposals: [],
  lastUpdated: null
}

// WebSocket connections for real-time updates (simplified approach)
const connections = new Set<ReadableStreamDefaultController>()

// Helper function to fetch proposal data from FastAPI
async function fetchProposalDataFromAPI(): Promise<ProposalData> {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/proposals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Ensure we always return a valid structure
    const proposals = Array.isArray(data.proposals) ? data.proposals : 
                     Array.isArray(data) ? data : []
    
    // Update cache
    proposalCache = {
      proposals,
      lastUpdated: new Date().toISOString()
    }
    
    return proposalCache
  } catch (error) {
    console.error('Error fetching from FastAPI:', error)
    // Return cached data if API is unavailable
    return proposalCache
  }
}

// Helper function to sync proposal updates to FastAPI
async function syncProposalToAPI(proposal: Proposal, method: 'POST' | 'PUT' | 'DELETE'): Promise<boolean> {
  try {
    const endpoint = method === 'DELETE' || method === 'PUT' ? 
      `${FASTAPI_BASE_URL}/proposals/${proposal.id}` : 
      `${FASTAPI_BASE_URL}/proposals`
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(method !== 'DELETE' && { body: JSON.stringify(proposal) })
    })

    if (!response.ok) {
      console.error(`FastAPI sync failed with status: ${response.status}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Error syncing to FastAPI:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const isStream = url.searchParams.get('stream') === 'true'
    
    // Fetch latest data from FastAPI
    await fetchProposalDataFromAPI()
    
    if (isStream) {
      // Server-Sent Events for real-time updates
      const stream = new ReadableStream({
        start(controller) {
          connections.add(controller)
          
          // Send initial data
          controller.enqueue(`data: ${JSON.stringify(proposalCache)}\n\n`)
          
          // Cleanup on close
          request.signal.addEventListener('abort', () => {
            connections.delete(controller)
            controller.close()
          })
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
    return NextResponse.json(proposalCache)
  } catch (error) {
    console.error('Proposal API GET error:', error)
    
    // Return a valid structure even on error
    const errorResponse = {
      proposals: proposalCache.proposals || [],
      lastUpdated: proposalCache.lastUpdated || new Date().toISOString(),
      error: 'Failed to fetch proposal data'
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the incoming data
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid proposal data' },
        { status: 400 }
      )
    }

    // Forward the request to FastAPI backend
    const response = await fetch(`${FASTAPI_BASE_URL}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`)
    }

    const result = await response.json()
    
    // Update cache with the result
    await fetchProposalDataFromAPI()
    
    // Broadcast updates to all connected clients
    const updateMessage = `data: ${JSON.stringify(proposalCache)}\n\n`
    connections.forEach(controller => {
      try {
        controller.enqueue(updateMessage)
      } catch (error) {
        console.error('Error sending update to client:', error)
        connections.delete(controller)
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Proposal data updated successfully',
      data: result 
    })
  } catch (error) {
    console.error('Proposal API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to update proposal data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposalId, ...updateData } = body
    
    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      )
    }

    // Create proposal object for sync
    const proposalData = {
      id: proposalId,
      ...updateData,
      updatedAt: new Date().toISOString()
    } as Proposal

    // Sync to FastAPI backend using helper function
    const syncSuccess = await syncProposalToAPI(proposalData, 'PUT')
    
    if (!syncSuccess) {
      throw new Error('Failed to sync with FastAPI backend')
    }
    
    // Update cache with latest data
    await fetchProposalDataFromAPI()
    
    // Broadcast updates to all connected clients
    const updateMessage = `data: ${JSON.stringify(proposalCache)}\n\n`
    connections.forEach(controller => {
      try {
        controller.enqueue(updateMessage)
      } catch (error) {
        console.error('Error sending update to client:', error)
        connections.delete(controller)
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Proposal updated successfully',
      data: proposalData 
    })
  } catch (error) {
    console.error('Proposal API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const proposalId = url.searchParams.get('id')
    
    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      )
    }

    // Create minimal proposal object for deletion
    const proposalData = { id: proposalId } as Proposal

    // Sync deletion to FastAPI backend using helper function
    const syncSuccess = await syncProposalToAPI(proposalData, 'DELETE')
    
    if (!syncSuccess) {
      throw new Error('Failed to sync deletion with FastAPI backend')
    }
    
    // Update cache with latest data
    await fetchProposalDataFromAPI()
    
    // Broadcast updates to all connected clients
    const updateMessage = `data: ${JSON.stringify(proposalCache)}\n\n`
    connections.forEach(controller => {
      try {
        controller.enqueue(updateMessage)
      } catch (error) {
        console.error('Error sending update to client:', error)
        connections.delete(controller)
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Proposal deleted successfully',
      data: { id: proposalId }
    })
  } catch (error) {
    console.error('Proposal API DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete proposal' },
      { status: 500 }
    )
  }
}
