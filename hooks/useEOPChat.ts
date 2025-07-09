import { useState, useCallback } from 'react'
import { useChatAPI } from './useChatAPI'
import { useProposalData } from './useProposalData'

// Import types from useProposalData
type TribalNationInfo = {
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

type HazardAssessment = {
  hazardType?: string
  riskLevel?: 'low' | 'moderate' | 'high' | 'extreme'
  probability?: string
  potentialImpact?: string
  vulnerabilities?: string[]
  mitigationMeasures?: string[]
}

type EmergencyResponse = {
  procedures?: string[]
  resourceRequirements?: string[]
  coordinationProtocols?: string[]
  communicationPlan?: string
  evacuationProcedures?: string
}

interface EOPChatMessage {
  message: string
  session_id?: string
  proposal_id?: string
  extractedData?: Partial<{
    tribalNationInfo: TribalNationInfo
    hazardAssessments: HazardAssessment[]
    emergencyResponse: EmergencyResponse
  }>
  [key: string]: unknown
}

interface EOPChatResponse {
  response: string
  nextQuestion?: string
  extractedData?: Record<string, unknown>
  proposalUpdated?: boolean
  completionPercentage?: number
  session_id?: string
  proposal_id?: string
}

interface ChatHistoryItem {
  role: 'user' | 'assistant'
  message: string
  timestamp: string
  extractedData?: Record<string, unknown>
}

export function useEOPChat() {
  const [currentSessionId, setCurrentSessionId] = useState<string>()
  const [currentProposalId, setCurrentProposalId] = useState<string>()
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])

  const { sendMessage, isLoading: chatLoading, error: chatError } = useChatAPI()
  const { 
    data: proposalData, 
    updateProposal, 
    isConnected: proposalConnected 
  } = useProposalData()

  const sendEOPMessage = useCallback(async (
    message: string, 
    options?: {
      sessionId?: string
      proposalId?: string
      forceNewSession?: boolean
    }
  ): Promise<EOPChatResponse> => {
    try {
      const sessionId = options?.forceNewSession ? 
        `session-${Date.now()}` : 
        (options?.sessionId || currentSessionId || `session-${Date.now()}`)
      
      const proposalId = options?.proposalId || currentProposalId || `proposal-${Date.now()}`

      const chatMessage: EOPChatMessage = {
        message,
        session_id: sessionId, // Use snake_case for FastAPI compatibility
        proposal_id: proposalId, // Use snake_case for FastAPI compatibility
        // Include any previously extracted data for context
        extractedData: Array.isArray(proposalData.proposals) 
          ? proposalData.proposals.find(p => p.id === proposalId) || {}
          : {}
      }

      const response = await sendMessage(chatMessage, sessionId)
      
      // Parse the response
      const eopResponse: EOPChatResponse = typeof response === 'string' ? 
        JSON.parse(response) : response

      // Update session and proposal IDs
      if (eopResponse.session_id) {
        setCurrentSessionId(eopResponse.session_id)
      }
      if (eopResponse.proposal_id) {
        setCurrentProposalId(eopResponse.proposal_id)
      }

      // Update chat history
      setChatHistory(prev => [
        ...prev,
        {
          role: 'user',
          message,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          message: eopResponse.response,
          timestamp: new Date().toISOString(),
          extractedData: eopResponse.extractedData
        }
      ])

      // If the chat extracted proposal data, update the proposal
      if (eopResponse.extractedData && eopResponse.proposal_id) {
        await updateProposal(eopResponse.proposal_id, {
          ...eopResponse.extractedData,
          sessionId: eopResponse.session_id,
          lastQuestionAnswered: message,
          nextQuestion: eopResponse.nextQuestion,
          completionPercentage: eopResponse.completionPercentage,
          updatedAt: new Date().toISOString()
        })
      }

      return eopResponse
    } catch (error) {
      console.error('EOP Chat error:', error)
      throw error
    }
  }, [currentSessionId, currentProposalId, proposalData, sendMessage, updateProposal])

  const startNewProposal = useCallback(() => {
    const newSessionId = `session-${Date.now()}`
    const newProposalId = `proposal-${Date.now()}`
    
    setCurrentSessionId(newSessionId)
    setCurrentProposalId(newProposalId)
    setChatHistory([])
    
    return { sessionId: newSessionId, proposalId: newProposalId }
  }, [])

  const loadProposal = useCallback((proposalId: string, sessionId?: string) => {
    setCurrentProposalId(proposalId)
    if (sessionId) {
      setCurrentSessionId(sessionId)
    }
    
    // Load chat history for this proposal/session if available
    // This would typically come from the backend
    setChatHistory([])
  }, [])

  const getCurrentProposal = useCallback(() => {
    if (!currentProposalId || !Array.isArray(proposalData.proposals)) return null
    return proposalData.proposals.find(p => p.id === currentProposalId) || null
  }, [currentProposalId, proposalData])

  const getProposalProgress = useCallback(() => {
    const proposal = getCurrentProposal()
    if (!proposal) return 0
    
    return proposal.completionPercentage || 0
  }, [getCurrentProposal])

  const getNextQuestion = useCallback(() => {
    const proposal = getCurrentProposal()
    if (!proposal) return "Let's start by telling me about your tribal nation. What is the name of your tribe?"
    
    return proposal.nextQuestion || "What would you like to work on next for your Emergency Operations Plan?"
  }, [getCurrentProposal])

  return {
    // Chat functionality
    sendEOPMessage,
    chatHistory,
    isLoading: chatLoading,
    error: chatError,
    
    // Proposal management
    startNewProposal,
    loadProposal,
    getCurrentProposal,
    getProposalProgress,
    getNextQuestion,
    
    // Current state
    currentSessionId,
    currentProposalId,
    proposalData,
    proposalConnected,
    
    // Proposal list
    allProposals: Array.isArray(proposalData.proposals) ? proposalData.proposals : []
  }
}
