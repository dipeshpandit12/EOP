"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestBackendConnection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testHealth = async () => {
    setStatus("loading")
    try {
      const response = await fetch('/api/test-fastapi/health')
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult(data)
      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }

  const testChat = async () => {
    setStatus("loading")
    try {
      const response = await fetch('/api/test-fastapi/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: "Hello, this is a test message",
          session_id: "test-session"
        })
      })
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResult(data)
      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>FastAPI Backend Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button onClick={testHealth} disabled={status === "loading"}>
                Test Health Endpoint
              </Button>
              <Button onClick={testChat} disabled={status === "loading"} variant="outline">
                Test Chat Endpoint
              </Button>
              {status === "loading" && <Badge>Testing...</Badge>}
              {status === "success" && <Badge variant="default" className="bg-green-500">Success</Badge>}
              {status === "error" && <Badge variant="destructive">Failed</Badge>}
            </div>
            
            {error && (
              <div className="p-4 border border-red-300 bg-red-50 rounded text-red-800">
                <p className="font-medium mb-1">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {result && (
              <div className="p-4 border border-gray-300 bg-muted rounded">
                <p className="font-medium mb-1">Response:</p>
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium">FastAPI URL:</p>
              <p>Using: {process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || process.env.FASTAPI_BASE_URL || 'http://localhost:8000'}</p>
              <p className="mt-2">This test tool helps diagnose connection issues between Next.js and the FastAPI backend.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
