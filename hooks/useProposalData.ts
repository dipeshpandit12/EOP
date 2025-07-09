import { useState, useEffect, useRef, useCallback } from 'react'

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

export function useProposalData() {
  const [data, setData] = useState<ProposalData>({ proposals: [], lastUpdated: null })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchProposalData = useCallback(async () => {
    try {
      const response = await fetch('/api/proposal')
      if (!response.ok) {
        throw new Error('Failed to fetch proposal data')
      }
      const result = await response.json()
      
      // Ensure the result has the expected structure
      if (result && typeof result === 'object') {
        setData({
          proposals: Array.isArray(result.proposals) ? result.proposals : [],
          lastUpdated: result.lastUpdated || new Date().toISOString()
        })
      } else {
        // Fallback to empty structure if result is malformed
        setData({ proposals: [], lastUpdated: new Date().toISOString() })
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Keep existing data on error, don't reset to empty
    }
  }, [])

  const setupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource('/api/proposal?stream=true')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const updatedData = JSON.parse(event.data)
        
        // Ensure the updatedData has the expected structure
        if (updatedData && typeof updatedData === 'object') {
          setData({
            proposals: Array.isArray(updatedData.proposals) ? updatedData.proposals : [],
            lastUpdated: updatedData.lastUpdated || new Date().toISOString()
          })
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setError('Connection lost. Attempting to reconnect...')
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        setupEventSource()
      }, 3000)
    }
  }, [])

  useEffect(() => {
    // Initial data fetch
    fetchProposalData()

    // Setup SSE connection for real-time updates
    setupEventSource()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [fetchProposalData, setupEventSource])

  const updateProposal = async (proposalId: string, updateData: Partial<Proposal>) => {
    try {
      const response = await fetch('/api/proposal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId, ...updateData })
      })

      if (!response.ok) {
        throw new Error('Failed to update proposal')
      }

      const result = await response.json()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update proposal')
      throw err
    }
  }

  const deleteProposal = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/proposal?id=${proposalId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete proposal')
      }

      const result = await response.json()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete proposal')
      throw err
    }
  }

  return {
    data,
    isConnected,
    error,
    updateProposal,
    deleteProposal,
    refetch: fetchProposalData
  }
}
