"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEOPChat } from "@/hooks/useEOPChat"
import { MessageCircle, FileText, Wifi, WifiOff, AlertTriangle, CheckCircle } from "lucide-react"

// Import types for better type safety
type HazardAssessment = {
  hazardType?: string
  riskLevel?: 'low' | 'moderate' | 'high' | 'extreme'
  probability?: string
  potentialImpact?: string
  vulnerabilities?: string[]
  mitigationMeasures?: string[]
}

type Proposal = {
  id: string
  status?: string
  completionPercentage?: number
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
  hazardAssessments?: HazardAssessment[]
  emergencyResponse?: {
    procedures?: string[]
    resourceRequirements?: string[]
    coordinationProtocols?: string[]
    communicationPlan?: string
    evacuationProcedures?: string
  }
  [key: string]: unknown
}

export function APITestComponent() {
  const [chatMessage, setChatMessage] = useState("")

  const { 
    sendEOPMessage, 
    chatHistory, 
    isLoading: chatLoading, 
    error: chatError,
    startNewProposal,
    getCurrentProposal,
    getProposalProgress,
    getNextQuestion,
    proposalConnected,
    allProposals,
    currentSessionId,
    currentProposalId
  } = useEOPChat()

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return
    
    try {
      await sendEOPMessage(chatMessage)
      setChatMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleStartNewProposal = () => {
    const { sessionId, proposalId } = startNewProposal()
    console.log(`Started new proposal: ${proposalId}, session: ${sessionId}`)
  }

  const currentProposal = getCurrentProposal()
  const progress = getProposalProgress()
  const nextQuestion = getNextQuestion()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">FEMA EOP Proposal Interface</h1>
      
      {/* Chat Interface Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              EOP Chat Assistant
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={proposalConnected ? "default" : "destructive"} className="flex items-center gap-1">
                {proposalConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {proposalConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Button size="sm" onClick={handleStartNewProposal}>
                New Proposal
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Conversational interface for creating FEMA Emergency Operations Plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Session Info */}
          {currentSessionId && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm">
                <strong>Session:</strong> {currentSessionId}
                {currentProposalId && (
                  <>
                    <br />
                    <strong>Proposal ID:</strong> {currentProposalId}
                    <br />
                    <strong>Progress:</strong> {progress}%
                  </>
                )}
              </div>
            </div>
          )}

          {/* Next Question Suggestion */}
          {nextQuestion && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-md">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <strong className="text-green-800">Suggested next question:</strong>
                  <p className="text-green-700 text-sm mt-1">{nextQuestion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat History */}
          <div className="space-y-2">
            <Label>Chat History:</Label>
            <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-auto">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">Start a conversation to build your EOP proposal</p>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded ${
                        msg.role === 'user' 
                          ? 'bg-blue-100 text-blue-900 ml-4' 
                          : 'bg-white text-gray-900 mr-4'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {msg.role === 'user' ? 'You' : 'EOP Assistant'}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      {msg.extractedData && (
                        <div className="mt-2 text-xs bg-green-100 p-2 rounded">
                          <strong>Extracted Data:</strong> {JSON.stringify(msg.extractedData, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="chat-message">Your Message</Label>
            <Textarea
              id="chat-message"
              placeholder={nextQuestion || "Ask about creating your Emergency Operations Plan..."}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSendMessage} 
            disabled={chatLoading || !chatMessage.trim()}
            className="w-full"
          >
            {chatLoading ? "Processing..." : "Send Message"}
          </Button>
          
          {chatError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-red-700 text-sm">{chatError}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Proposal Details */}
      {currentProposal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Current Proposal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Badge variant="outline" className="mt-1">
                  {currentProposal.status || 'draft'}
                </Badge>
              </div>
              <div>
                <Label>Completion</Label>
                <div className="mt-1 text-sm font-medium">{progress}%</div>
              </div>
            </div>

            {/* Tribal Nation Info */}
            {currentProposal.tribalNationInfo && (
              <div className="space-y-2">
                <Label>Tribal Nation Information</Label>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {Object.entries(currentProposal.tribalNationInfo).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {
                        typeof value === 'object' ? JSON.stringify(value) : String(value)
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hazard Assessments */}
            {currentProposal.hazardAssessments && currentProposal.hazardAssessments.length > 0 && (
              <div className="space-y-2">
                <Label>Hazard Assessments ({currentProposal.hazardAssessments.length})</Label>
                <div className="space-y-2">
                  {currentProposal.hazardAssessments.map((hazard: HazardAssessment, index: number) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded-md text-sm">
                      <div><strong>Type:</strong> {hazard.hazardType || 'Not specified'}</div>
                      <div><strong>Risk Level:</strong> {hazard.riskLevel || 'Not assessed'}</div>
                      {hazard.potentialImpact && (
                        <div><strong>Impact:</strong> {hazard.potentialImpact}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Response */}
            {currentProposal.emergencyResponse && (
              <div className="space-y-2">
                <Label>Emergency Response Plans</Label>
                <div className="bg-blue-50 p-3 rounded-md text-sm">
                  {Object.entries(currentProposal.emergencyResponse).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {
                        Array.isArray(value) ? value.join(', ') : String(value)
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Proposals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All EOP Proposals ({allProposals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allProposals.length === 0 ? (
            <p className="text-gray-500 text-sm">No proposals created yet</p>
          ) : (
            <div className="space-y-2">
              {allProposals.map((proposal: Proposal) => (
                <div key={proposal.id} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{proposal.id}</h4>
                      <p className="text-sm text-gray-600">
                        {proposal.tribalNationInfo?.name || 'Tribal Nation TBD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {proposal.status || 'draft'}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {proposal.completionPercentage || 0}% complete
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
