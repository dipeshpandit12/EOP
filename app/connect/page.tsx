// File: app/connect/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Server, Database, MessageCircle, BrainCircuit, RotateCw, CheckCircle, AlertCircle, Clock } from "lucide-react"

// Type definition for health check response
type HealthStatus = {
  status: 'healthy' | 'degraded'
  components: {
    api_server: ComponentStatus
    gemini_service: ComponentStatus
    database: ComponentStatus
    proposal_generation: ComponentStatus
    realtime_updates: ComponentStatus
  }
  timestamp: string
}

type ComponentStatus = {
  status: 'ok' | 'error' | 'unknown'
  message: string
}

export default function ConnectPage() {
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [testing, setTesting] = useState(false)
  const [healthData, setHealthData] = useState<HealthStatus | null>(null)
  const [nextCheckIn, setNextCheckIn] = useState<number>(1200)

  const testConnections = async () => {
    setTesting(true)
    setNextCheckIn(1200)

    try {
      // Get all system health information from our Next.js API connect endpoint
      try {
        const healthApiResponse = await fetch('/api/connect', { 
          method: 'GET',
          // Add timeout to avoid hanging
          signal: AbortSignal.timeout(10000)
        })
        if (healthApiResponse.ok) {
          // Parse and store the health data
          try {
            const healthStatusData = await healthApiResponse.json()
            
            // Log the response for debugging with more details
            console.log('Health API response:', JSON.stringify(healthStatusData, null, 2));
            console.log('API server status:', healthStatusData?.components?.api_server?.status);
            console.log('Database status:', healthStatusData?.components?.database?.status);
            console.log('Gemini service status:', healthStatusData?.components?.gemini_service?.status);
            console.log('Overall health status:', healthStatusData?.status);
            
            // Store the complete health data
            setHealthData(healthStatusData)
          } catch (parseError) {
            console.error('Failed to parse health data:', parseError)
            setHealthData(null)
          }
        } else {
          console.error('Health API responded with error:', healthApiResponse.status)
          setHealthData(null)
        }
      } catch (apiError) {
        console.error('Health API connection failed:', apiError)
        setHealthData(null)
      }

      setLastChecked(new Date())
    } catch (error) {
      console.error('Connection test failed:', error)
      setHealthData(null)
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    testConnections()
    
    // Auto-test every 20 minutes
    const checkInterval = setInterval(testConnections, 1200000)
    
    // Set up countdown timer that updates every second
    const countdownInterval = setInterval(() => {
      setNextCheckIn(prev => {
        if (prev <= 1) {
          return 1200; // Reset to 1200 when reaching 0 (20 minutes = 1200 seconds)
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(checkInterval);
      clearInterval(countdownInterval);
    }
  }, [])

  // Helper function to render status icon
  const getStatusIcon = (status: string) => {
    if (status === 'ok') return <CheckCircle className="h-4 w-4 mr-1" />
    if (status === 'unknown') return <RefreshCw className="h-4 w-4 mr-1" />
    return <AlertCircle className="h-4 w-4 mr-1" />
  }

  // Overall system status
  const isSystemHealthy = healthData?.status === 'healthy';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="px-2 sm:px-4">
              <Link href="/" className="text-sm sm:text-lg font-semibold truncate">
                ← Back to Chat
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isSystemHealthy ? "default" : "destructive"}
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                {isSystemHealthy ? (
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

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold pl-2">System Connection Dashboard</h1>
            <p className="text-muted-foreground pl-2 text-sm sm:text-base">
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
                Status of all backend components and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthData ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {/* API Server Status */}
                    <div className={`p-3 sm:p-4 border rounded-lg h-28 sm:h-32 ${healthData.components.api_server.status === 'ok' ? 'bg-green-50 border-green-200' : ''}`}>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <h3 className="font-medium text-sm sm:text-base">API Server</h3>
                        </div>
                        <Badge 
                          variant={healthData.components.api_server.status === 'ok' ? "default" : "destructive"}
                          className={`text-xs ${healthData.components.api_server.status === 'ok' ? "bg-green-500 hover:bg-green-600" : ""}`}
                        >
                          {getStatusIcon(healthData.components.api_server.status)}
                          {healthData.components.api_server.status.toUpperCase()}
                        </Badge>
                      </div>
                      {healthData.components.api_server.status === 'ok' ? (
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{healthData.components.api_server.message}</p>
                      ) : (
                        <p className="text-xs sm:text-sm text-amber-600 flex items-start">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="break-words">See system issues below</span>
                        </p>
                      )}
                    </div>

                    {/* Database Status */}
                    <div className={`p-3 sm:p-4 border rounded-lg h-28 sm:h-32 ${healthData.components.database.status === 'ok' ? 'bg-green-50 border-green-200' : ''}`}>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <h3 className="font-medium text-sm sm:text-base">Database</h3>
                        </div>
                        <Badge 
                          variant={healthData.components.database.status === 'ok' ? "default" : "destructive"}
                          className={`text-xs ${healthData.components.database.status === 'ok' ? "bg-green-500 hover:bg-green-600" : ""}`}
                        >
                          {getStatusIcon(healthData.components.database.status)}
                          {healthData.components.database.status.toUpperCase()}
                        </Badge>
                      </div>
                      {healthData.components.database.status === 'ok' ? (
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{healthData.components.database.message}</p>
                      ) : (
                        <p className="text-xs sm:text-sm text-amber-600 flex items-start">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="break-words">See system issues below</span>
                        </p>
                      )}
                    </div>

                    {/* Gemini AI Status */}
                    <div className={`p-3 sm:p-4 border rounded-lg h-28 sm:h-32 ${healthData.components.gemini_service.status === 'ok' ? 'bg-green-50 border-green-200' : ''}`}>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <h3 className="font-medium text-sm sm:text-base">Gemini AI</h3>
                        </div>
                        <Badge 
                          variant={healthData.components.gemini_service.status === 'ok' ? "default" : "destructive"}
                          className={`text-xs ${healthData.components.gemini_service.status === 'ok' ? "bg-green-500 hover:bg-green-600" : ""}`}
                        >
                          {getStatusIcon(healthData.components.gemini_service.status)}
                          {healthData.components.gemini_service.status.toUpperCase()}
                        </Badge>
                      </div>
                      {healthData.components.gemini_service.status === 'ok' ? (
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{healthData.components.gemini_service.message}</p>
                      ) : (
                        <p className="text-xs sm:text-sm text-amber-600 flex items-start">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="break-words">See system issues below</span>
                        </p>
                      )}
                    </div>

                    {/* Proposal Engine Status */}
                    <div className={`p-3 sm:p-4 border rounded-lg h-28 sm:h-32 ${healthData.components.proposal_generation.status === 'ok' ? 'bg-green-50 border-green-200' : ''}`}>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <h3 className="font-medium text-sm sm:text-base">Proposal Engine</h3>
                        </div>
                        <Badge 
                          variant={healthData.components.proposal_generation.status === 'ok' ? "default" : "destructive"}
                          className={`text-xs ${healthData.components.proposal_generation.status === 'ok' ? "bg-green-500 hover:bg-green-600" : ""}`}
                        >
                          {getStatusIcon(healthData.components.proposal_generation.status)}
                          {healthData.components.proposal_generation.status.toUpperCase()}
                        </Badge>
                      </div>
                      {healthData.components.proposal_generation.status === 'ok' ? (
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{healthData.components.proposal_generation.message}</p>
                      ) : (
                        <p className="text-xs sm:text-sm text-amber-600 flex items-start">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="break-words">See system issues below</span>
                        </p>
                      )}
                    </div>

                    {/* Real-time Updates Status */}
                    <div className={`p-3 sm:p-4 border rounded-lg h-28 sm:h-32 ${healthData.components.realtime_updates.status === 'ok' ? 'bg-green-50 border-green-200' : ''}`}>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center gap-2">
                          <RotateCw className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <h3 className="font-medium text-sm sm:text-base">Real-time Updates</h3>
                        </div>
                        <Badge 
                          variant={healthData.components.realtime_updates.status === 'ok' ? "default" : "destructive"}
                          className={`text-xs ${healthData.components.realtime_updates.status === 'ok' ? "bg-green-500 hover:bg-green-600" : ""}`}
                        >
                          {getStatusIcon(healthData.components.realtime_updates.status)}
                          {healthData.components.realtime_updates.status.toUpperCase()}
                        </Badge>
                      </div>
                      {healthData.components.realtime_updates.status === 'ok' ? (
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{healthData.components.realtime_updates.message}</p>
                      ) : (
                        <p className="text-xs sm:text-sm text-amber-600 flex items-start">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="break-words">See system issues below</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Overall System Status */}
                  <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${healthData.status === 'healthy' ? 'bg-green-50 border border-green-200' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Server className="h-5 w-5 sm:h-6 sm:w-6" />
                      <h3 className="font-semibold text-base sm:text-lg">Overall System Status</h3>
                    </div>
                    <Badge 
                      className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1" 
                      variant={healthData.status === 'healthy' ? "default" : "destructive"}
                      style={healthData.status === 'healthy' ? {backgroundColor: 'rgb(34 197 94)', color: 'white'} : {}}
                    >
                      {healthData.status === 'healthy' ? (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      ) : (
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      )}
                      {healthData.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {lastChecked ? (
                        <span className="flex flex-wrap">
                          <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
                          {testing && <span className="ml-1 sm:ml-2 text-blue-500">(Checking now...)</span>}
                          {!testing && (
                            <span className="ml-1 sm:ml-2 text-gray-400">
                              (Next check in {Math.floor(nextCheckIn / 60)}m {nextCheckIn % 60}s)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>Never checked</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={testConnections}
                      disabled={testing}
                      className="text-xs sm:text-sm py-1 h-auto self-end sm:self-auto"
                    >
                      {testing ? (
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                      ) : (
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      )}
                      Check Now
                    </Button>
                  </div>
                  
                  {/* Connection Issues Warning */}
                  {(healthData.status === 'degraded' || 
                    Object.values(healthData.components).some(component => component.status !== 'ok')) && (
                    <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="flex items-center gap-1 sm:gap-2 font-medium text-yellow-800 mb-1 sm:mb-2 text-sm sm:text-base">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        System Issues Detected
                      </h4>
                      <div className="text-xs sm:text-sm text-yellow-700 space-y-1 sm:space-y-2">
                        <p>The following components are reporting issues:</p>
                        <ul className="list-disc list-outside ml-4 sm:ml-5 space-y-0.5 sm:space-y-1">
                          {healthData.components.api_server.status !== 'ok' && (
                            <li className="break-words">
                              <span className="font-medium">API Server:</span> {healthData.components.api_server.message}
                            </li>
                          )}
                          {healthData.components.database.status !== 'ok' && (
                            <li className="break-words">
                              <span className="font-medium">Database:</span> {healthData.components.database.message}
                            </li>
                          )}
                          {healthData.components.gemini_service.status !== 'ok' && (
                            <li className="break-words">
                              <span className="font-medium">Gemini AI:</span> {healthData.components.gemini_service.message}
                            </li>
                          )}
                          {healthData.components.proposal_generation.status !== 'ok' && (
                            <li className="break-words">
                              <span className="font-medium">Proposal Engine:</span> {healthData.components.proposal_generation.message}
                            </li>
                          )}
                          {healthData.components.realtime_updates.status !== 'ok' && (
                            <li className="break-words">
                              <span className="font-medium">Real-time Updates:</span> {healthData.components.realtime_updates.message}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <div className="mb-3 sm:mb-4">
                    {testing ? (
                      <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground animate-spin" />
                    ) : (
                      <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                    {testing ? 'Checking System Status...' : 'Could not retrieve system status'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md mb-3 sm:mb-4 px-2">
                    {testing 
                      ? 'Please wait while we check the status of all system components...'
                      : 'Unable to connect to the backend server. Please ensure the server is running and try again.'}
                  </p>
                  {!testing && (
                    <Button onClick={testConnections} variant="outline" className="text-xs sm:text-sm py-1 h-auto">
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Try Again
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}