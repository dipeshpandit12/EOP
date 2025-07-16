"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEOPChat } from "@/hooks/useEOPChat"
import { ArrowRight, Heart, CheckCircle, Wifi, WifiOff, Bot } from "lucide-react"

export default function Page() {
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  const {
    getCurrentProposal,
    getProposalProgress
  } = useEOPChat()

  // Test FastAPI connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/connect', { 
          method: 'GET',
          // Add timeout to avoid hanging
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          try {
            const healthData = await response.json()
            // Set status based on overall system health
            if (healthData.status === 'healthy') {
              console.log('System health verified: HEALTHY')
              setApiConnectionStatus('connected')
            } else {
              console.log('System health issue:', healthData.status || 'Unknown error')
              setApiConnectionStatus('disconnected')
            }
          } catch (parseError) {
            console.error('Failed to parse health data:', parseError)
            setApiConnectionStatus('disconnected')
          }
        } else {
          setApiConnectionStatus('disconnected')
        }
      } catch (error) {
        console.error('Connection test failed:', error)
        setApiConnectionStatus('disconnected')
      }
    }

    testConnection()
    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const currentProposal = getCurrentProposal()
  const progress = getProposalProgress()

  return (
    <div className="min-h-svh bg-gradient-to-br from-background via-background to-muted/20">
      {/* Top bar with theme toggle and connection status */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={apiConnectionStatus === 'connected' ? "default" : "destructive"} 
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            asChild
          >
            <Link href="/connect" title="View connection details">
              {apiConnectionStatus === 'connected' ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              System {apiConnectionStatus === 'checking' ? 'Checking...' : 
                     apiConnectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Link>
          </Badge>
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>

      <div className="flex min-h-svh">
        {/* Main landing content */}
        <div className="w-full flex items-center justify-center px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              Community-Driven Emergency Preparedness
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Empowering the Omaha Tribe
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Using advanced AI technology to help the Omaha Tribe create comprehensive Emergency Operation Plans (EOP)
              that protect and serve their community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/dashboard">
                  <Bot className="mr-2 h-5 w-5" />
                  Create EOP with AI
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Progress indicator if there's an active proposal */}
            {currentProposal && (
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Active EOP in Progress</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentProposal.tribalNationInfo?.name || 'Your Proposal'} - {progress}% Complete
                </div>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/dashboard">
                    Continue Working
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
