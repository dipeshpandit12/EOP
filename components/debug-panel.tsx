import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, EyeOff, RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react'

interface DebugPanelProps {
  debugInfo: {
    lastRequestTime?: string
    lastResponseTime?: string
    requestCount?: number
  }
  connectionStatus: {
    api: 'checking' | 'connected' | 'disconnected'
    proposal: boolean
  }
  lastError?: string | null
  onTestConnection?: () => void
  recentLogs?: Array<{
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
  }>
}

export function DebugPanel({ 
  debugInfo, 
  connectionStatus, 
  lastError,
  onTestConnection,
  recentLogs = []
}: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Use either passed logs or empty array

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[60vh]">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Debug Panel
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Connection Status */}
          <div>
            <h4 className="text-xs font-medium mb-2">Connection Status</h4>
            <div className="flex gap-2">
              <Badge 
                variant={connectionStatus.api === 'connected' ? "default" : "destructive"}
                className="text-xs"
              >
                {connectionStatus.api === 'connected' ? (
                  <Wifi className="h-3 w-3 mr-1" />
                ) : (
                  <WifiOff className="h-3 w-3 mr-1" />
                )}
                API: {connectionStatus.api}
              </Badge>
              <Badge 
                variant={connectionStatus.proposal ? "default" : "destructive"}
                className="text-xs"
              >
                {connectionStatus.proposal ? (
                  <Wifi className="h-3 w-3 mr-1" />
                ) : (
                  <WifiOff className="h-3 w-3 mr-1" />
                )}
                SSE: {connectionStatus.proposal ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>

          {/* Debug Info */}
          <div>
            <h4 className="text-xs font-medium mb-2">Request Info</h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>Requests: {debugInfo.requestCount || 0}</div>
              {debugInfo.lastRequestTime && (
                <div>Last Request: {new Date(debugInfo.lastRequestTime).toLocaleTimeString()}</div>
              )}
              {debugInfo.lastResponseTime && (
                <div>Last Response: {new Date(debugInfo.lastResponseTime).toLocaleTimeString()}</div>
              )}
            </div>
          </div>

          {/* Last Error */}
          {lastError && (
            <div>
              <h4 className="text-xs font-medium mb-2 text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Last Error
              </h4>
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                {lastError}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium">Recent Logs</h4>
              <div className="text-xs text-muted-foreground">
                {recentLogs.length} entries
              </div>
            </div>
            <ScrollArea className="h-32 border rounded">
              <div className="p-2 space-y-1">
                {recentLogs.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No logs yet</div>
                ) : (
                  recentLogs.slice(-20).map((log, index) => (
                    <div 
                      key={index}
                      className={`text-xs p-1 rounded ${
                        log.level === 'error' ? 'bg-red-50 text-red-700' :
                        log.level === 'warn' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div>{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTestConnection}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log('[Debug] Testing Gemini integration via FastAPI...')
                try {
                  const testMessage = {
                    message: "Tell me specifically about emergency planning for tribal nations. This should be a detailed, unique response, not a test message.",
                    session_id: "debug-test-session",
                    proposal_id: "debug-test-proposal",
                    timestamp: new Date().toISOString()
                  }
                  
                  console.log('[Debug] Sending to FastAPI:', testMessage)
                  
                  const response = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testMessage)
                  })
                  
                  const result = await response.json()
                  console.log('[Debug] FastAPI Gemini response:', result)
                  
                  // Check if it's still a test response
                  const isTestResponse = result.response?.includes?.('test response while we set up') || 
                                        result.response?.includes?.('Hello! I received your message')
                  
                  const responseLength = result.response?.length || 0
                  const seemsLikeAI = responseLength > 100 && !isTestResponse
                  
                  alert(`Gemini API Test Results:\n\n` +
                    `✅ FastAPI Status: ${response.ok ? 'Success' : 'Failed'}\n` +
                    `🤖 Using Real Gemini AI: ${seemsLikeAI ? 'YES!' : 'NO - Still test responses'}\n` +
                    `📝 Response Length: ${responseLength} characters\n\n` +
                    `First 150 chars: "${result.response?.substring(0, 150)}..."\n\n` +
                    `Check console for full response details.`)
                } catch (error) {
                  console.error('[Debug] Gemini API test failed:', error)
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                  alert(`❌ Gemini API Test Failed!\n\nError: ${errorMessage}\n\nThis suggests:\n1. FastAPI server is down\n2. CORS issues\n3. Network connectivity problems\n\nCheck console for details.`)
                }
              }}
              className="text-xs"
            >
              🔍 Test Gemini
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('[Debug] Current state:', {
                  debugInfo,
                  connectionStatus,
                  lastError,
                  timestamp: new Date().toISOString()
                })
              }}
              className="text-xs"
            >
              Log State
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
