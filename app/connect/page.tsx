"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEOPChat } from "@/hooks/useEOPChat"
import { Wifi, WifiOff, RefreshCw, Server, Database, MessageCircle } from "lucide-react"

// Type definition for proposal data
type Proposal = {
  id: string
  status?: string
  completionPercentage?: number
  [key: string]: unknown
}

export default function ConnectPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [chatStatus, setChatStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [testing, setTesting] = useState(false)

  const { proposalConnected, allProposals } = useEOPChat()

  const testConnections = async () => {
    setTesting(true)
    setApiStatus('checking')
    setChatStatus('checking')

    try {
      // Test FastAPI backend directly for Proposal API
      try {
        const fastApiProposalResponse = await fetch('http://localhost:8000/proposals', { 
          method: 'GET',
          // Add timeout to avoid hanging
          signal: AbortSignal.timeout(5000)
        })
        setApiStatus(fastApiProposalResponse.ok ? 'connected' : 'disconnected')
      } catch (apiError) {
        console.error('FastAPI Proposal connection failed:', apiError)
        setApiStatus('disconnected')
      }

      // Test FastAPI backend directly for Chat API
      try {
        const fastApiChatResponse = await fetch('http://localhost:8000/health', { 
          method: 'GET',
          // Add timeout to avoid hanging
          signal: AbortSignal.timeout(5000)
        })
        setChatStatus(fastApiChatResponse.ok ? 'connected' : 'disconnected')
      } catch (chatError) {
        console.error('FastAPI Chat connection failed:', chatError)
        setChatStatus('disconnected')
      }

      setLastChecked(new Date())
    } catch (error) {
      console.error('Connection test failed:', error)
      setApiStatus('disconnected')
      setChatStatus('disconnected')
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    testConnections()
    // Auto-test every 60 seconds
    const interval = setInterval(testConnections, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/" className="text-lg font-semibold">
                ← Back to Chat Interface
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Badge 
                variant={apiStatus === 'connected' && chatStatus === 'connected' && proposalConnected ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {apiStatus === 'connected' && chatStatus === 'connected' && proposalConnected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                System Status
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">System Connection Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your Emergency Operations Plan development and system status
            </p>
          </div>

          {/* Connection Status Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Direct connection status to FastAPI backend server (localhost:8000)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Proposal API Status */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">FastAPI Proposals</span>
                  </div>
                  <Badge variant={apiStatus === 'connected' ? "default" : "destructive"}>
                    {apiStatus === 'checking' ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : apiStatus === 'connected' ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {apiStatus === 'checking' ? 'Checking' : 
                     apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                {/* Chat API Status */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">FastAPI Health</span>
                  </div>
                  <Badge variant={chatStatus === 'connected' ? "default" : "destructive"}>
                    {chatStatus === 'checking' ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : chatStatus === 'connected' ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {chatStatus === 'checking' ? 'Checking' : 
                     chatStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                {/* Real-time Connection */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span className="font-medium">Real-time Updates</span>
                  </div>
                  <Badge variant={proposalConnected ? "default" : "destructive"}>
                    {proposalConnected ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {proposalConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {lastChecked ? (
                    <>Last checked: {lastChecked.toLocaleTimeString()}</>
                  ) : (
                    'Never checked'
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testConnections}
                  disabled={testing}
                >
                  {testing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>

              {/* Connection Issues Warning */}
              {(apiStatus === 'disconnected' || chatStatus === 'disconnected') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Connection Issues Detected</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>Some services are not responding. Please check:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>FastAPI server is running on localhost:8000</li>
                      <li>All required dependencies are installed</li>
                      <li>Environment variables are correctly configured</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposal Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>EOP Development Progress</CardTitle>
              <CardDescription>
                Overview of Emergency Operations Plan proposals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{allProposals.length}</div>
                  <div className="text-sm text-muted-foreground">Total Proposals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {allProposals.filter((p: Proposal) => p.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {allProposals.filter((p: Proposal) => p.status === 'submitted').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {allProposals.length > 0 ? 
                      Math.round(allProposals.reduce((sum: number, p: Proposal) => sum + (p.completionPercentage || 0), 0) / allProposals.length) : 0
                    }%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
