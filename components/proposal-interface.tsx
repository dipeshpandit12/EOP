"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Clock, AlertTriangle, MapPin, Shield} from "lucide-react"


import { useState } from "react"

export function ProposalInterface({ className }: { className?: string }) {
  const [currentStep, setCurrentStep] = useState(1)

  // Step data for UI
  const steps = [
    {
      id: 1,
      icon: MapPin,
      label: "Tribal Nation Information",
      description: "Basic information about your tribal nation and government structure",
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tribal Nation Information
            </CardTitle>
            <CardDescription>
              Basic information about your tribal nation and government structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 2,
      icon: AlertTriangle,
      label: "Hazard Assessment",
      description: "Identify and assess potential hazards and risks",
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Hazard Assessment
            </CardTitle>
            <CardDescription>
              Identify and assess potential hazards and risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 3,
      icon: Shield,
      label: "Emergency Response Plan",
      description: "Develop response procedures and protocols",
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Emergency Response Plan
            </CardTitle>
            <CardDescription>
              Develop response procedures and protocols
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 4,
      icon: FileText,
      label: "Review & Finalize",
      description: "Review all sections and finalize your EOP",
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Review & Finalize
            </CardTitle>
            <CardDescription>
              Review all sections and finalize your EOP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step summary cards */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Tribal Nation Information</p>
                    <p className="text-sm text-muted-foreground">Basic information about your tribal nation and government structure</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Hazard Assessment</p>
                    <p className="text-sm text-muted-foreground">Identify and assess potential hazards and risks</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Emergency Response Plan</p>
                    <p className="text-sm text-muted-foreground">Develop response procedures and protocols</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <Button className="w-full" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Final EOP Document
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Complete all sections to generate the final document
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ]

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
          <Badge variant="outline">Step {currentStep} of 4</Badge>
        </div>
        {/* Step Progress UI */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">EOP Development Progress</h3>
            <Badge variant="outline">0% Complete</Badge>
          </div>
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div className="flex items-center flex-shrink-0" key={step.id}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${
                      currentStep === step.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 text-muted-foreground hover:border-primary'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-12 h-0.5 mx-2 bg-muted-foreground/30" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {steps[currentStep - 1].content}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
