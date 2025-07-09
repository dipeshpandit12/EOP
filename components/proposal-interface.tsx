"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEOPChat } from "@/hooks/useEOPChat"
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Edit3,
  Save,
  Plus,
  MapPin,
  Shield,
  Check,
  Circle
} from "lucide-react"

interface ProposalInterfaceProps {
  className?: string
}

interface Step {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  current: boolean
}

export function ProposalInterface({ className }: ProposalInterfaceProps) {
  const { getCurrentProposal, getProposalProgress } = useEOPChat()
  const [editMode, setEditMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const currentProposal = getCurrentProposal()
  const progress = getProposalProgress()

  // Define the workflow steps
  const steps: Step[] = [
    {
      id: 1,
      title: "Tribal Nation Information",
      description: "Basic information about your tribal nation and government structure",
      icon: MapPin,
      completed: !!(currentProposal?.tribalNationInfo?.name && currentProposal?.tribalNationInfo?.location),
      current: currentStep === 1
    },
    {
      id: 2,
      title: "Hazard Assessment",
      description: "Identify and assess potential hazards and risks",
      icon: AlertTriangle,
      completed: !!(currentProposal?.hazardAssessments && currentProposal?.hazardAssessments.length > 0),
      current: currentStep === 2
    },
    {
      id: 3,
      title: "Emergency Response Plan",
      description: "Develop response procedures and protocols",
      icon: Shield,
      completed: !!(currentProposal?.emergencyResponse?.procedures && currentProposal?.emergencyResponse?.procedures.length > 0),
      current: currentStep === 3
    },
    {
      id: 4,
      title: "Review & Finalize",
      description: "Review all sections and finalize your EOP",
      icon: FileText,
      completed: progress >= 90,
      current: currentStep === 4
    }
  ]

  const renderStepProgress = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">EOP Development Progress</h3>
        <Badge variant="outline">{progress}% Complete</Badge>
      </div>
      
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${
                  step.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.current
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-primary'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                {step.completed ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-muted-foreground/30'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderTribalInfoStep = () => (
    <div className="space-y-6">
      {/* Content will be populated by API */}
    </div>
  )

  const renderHazardAssessmentStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Hazard Assessment
          </CardTitle>
          <CardDescription>
            Identify and assess potential hazards and risks for your tribal nation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentProposal?.hazardAssessments && currentProposal.hazardAssessments.length > 0 ? (
            <div className="space-y-4">
              {currentProposal.hazardAssessments.map((hazard, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Circle className="h-4 w-4" />
                      {hazard.hazardType || `Hazard ${index + 1}`}
                    </h4>
                    <Badge variant={
                      hazard.riskLevel === 'extreme' ? 'destructive' :
                      hazard.riskLevel === 'high' ? 'destructive' :
                      hazard.riskLevel === 'moderate' ? 'default' : 'secondary'
                    }>
                      {hazard.riskLevel || 'Unknown'} Risk
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Probability</Label>
                      <p className="mt-1">{hazard.probability || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Potential Impact</Label>
                      <p className="mt-1">{hazard.potentialImpact || 'Not specified'}</p>
                    </div>
                  </div>
                  {hazard.vulnerabilities && hazard.vulnerabilities.length > 0 && (
                    <div className="mt-3">
                      <Label className="text-xs font-medium text-muted-foreground">Vulnerabilities</Label>
                      <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                        {hazard.vulnerabilities.map((vuln, vIndex) => (
                          <li key={vIndex}>{vuln}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Hazard
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Hazards Identified</h3>
              <p className="text-muted-foreground mb-4">
                Use the AI assistant to identify and assess potential hazards for your area.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Identify Hazards
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderEmergencyResponseStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Response Plan
          </CardTitle>
          <CardDescription>
            Develop comprehensive response procedures and protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentProposal?.emergencyResponse ? (
            <div className="space-y-6">
              {currentProposal.emergencyResponse.procedures && currentProposal.emergencyResponse.procedures.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Response Procedures</Label>
                  <div className="space-y-2">
                    {currentProposal.emergencyResponse.procedures.map((procedure, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{procedure}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Procedure
                  </Button>
                </div>
              )}
              
              {currentProposal.emergencyResponse.communicationPlan && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Communication Plan</Label>
                  <Textarea 
                    value={currentProposal.emergencyResponse.communicationPlan} 
                    readOnly={!editMode}
                    className={editMode ? '' : 'bg-muted'}
                    rows={4}
                  />
                </div>
              )}
              
              {currentProposal.emergencyResponse.evacuationProcedures && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Evacuation Procedures</Label>
                  <Textarea 
                    value={currentProposal.emergencyResponse.evacuationProcedures} 
                    readOnly={!editMode}
                    className={editMode ? '' : 'bg-muted'}
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-2">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Response Plan
                  </Button>
                ) : (
                  <Button onClick={() => setEditMode(false)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Response Plan</h3>
              <p className="text-muted-foreground mb-4">
                Work with the AI assistant to develop your emergency response procedures.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Response Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review & Finalize
          </CardTitle>
          <CardDescription>
            Review all sections of your Emergency Operations Plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.slice(0, -1).map((step) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.completed ? (
                      <Badge variant="default" className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Incomplete
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(step.id)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              )
            })}
            
            <div className="pt-4 border-t">
              <Button className="w-full" disabled={progress < 90}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Final EOP Document
              </Button>
              {progress < 90 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Complete all sections to generate the final document
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderTribalInfoStep()
      case 2:
        return renderHazardAssessmentStep()
      case 3:
        return renderEmergencyResponseStep()
      case 4:
        return renderReviewStep()
      default:
        return renderTribalInfoStep()
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">EOP Canvas</h2>
            <p className="text-sm text-muted-foreground">
              Step-by-step Emergency Operations Plan development
            </p>
          </div>
          <Badge variant="outline">
            Step {currentStep} of {steps.length}
          </Badge>
        </div>
        
        {renderStepProgress()}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <>
              {renderCurrentStep()}
              
              {/* Navigation section removed - will be managed by API */}
            </>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
