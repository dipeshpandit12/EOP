"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEOPChat } from "@/hooks/useEOPChat"
import {
  FileText,
  Clock,
  AlertTriangle,
  MapPin,
  Shield,
  Check,
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
      Content will be populated by API
    </div>
  )

  const renderHazardAssessmentStep = () => (
    <div className="space-y-6">
        {/* Content will be populated by API */}
        Content will be populated by API
    </div>
  )

  const renderEmergencyResponseStep = () => (
    <div className="space-y-6">
        Content will be populated by API
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
