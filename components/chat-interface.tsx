"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      content: "Hello! 👋 I'm your Emergency Operations Plan assistant. I'll help you create your FEMA EOP proposal. How can I help you today?",
      sender: "bot",
      timestamp: new Date("2024-01-01T12:00:00Z"), // Fixed timestamp to prevent hydration mismatch
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState("session-loading") // Initial static value
  const [messageCounter, setMessageCounter] = useState(1)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Generate session ID after component mounts to avoid SSR mismatch
  useEffect(() => {
    // Generate unique session ID only on client side
    const dynamicSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(dynamicSessionId)
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${messageCounter}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessageCounter(prev => prev + 1)
    const currentInput = input
    setInput("")
    setIsTyping(true)

    try {
      // Make API call to your FastAPI backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentInput
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      const botMessage: Message = {
        id: `bot-${messageCounter}`,
        content: data.response || "I received your message but couldn't process it properly.",
        sender: "bot",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, botMessage])
      setMessageCounter(prev => prev + 1)
      
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: `error-${messageCounter}`,
        content: `Sorry, I'm having trouble connecting to the server. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check that the FastAPI server is running on port 8000.`,
        sender: "bot",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
      setMessageCounter(prev => prev + 1)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card/50">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold">EOP Assistant</h2>
          <p className="text-sm text-muted-foreground">Emergency Operations Plan Helper</p>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          Session: {sessionId === "session-loading" ? "••••••••" : sessionId.slice(-8)}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.getHours().toString().padStart(2, '0')}:
                    {message.timestamp.getMinutes().toString().padStart(2, '0')}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-card/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Emergency Operations Plans... 💬"
            className="flex-1"
            disabled={isTyping}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}