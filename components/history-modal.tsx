"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Clock, Trash2 } from "lucide-react"

interface HistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock data for chat history
const chatHistory = [
  {
    id: "1",
    title: "Project Planning Discussion",
    date: "2024-01-15",
    time: "14:30",
    messageCount: 12,
    preview: "Discussed the new dashboard features and timeline...",
    status: "completed",
  },
  {
    id: "2",
    title: "UI Design Feedback",
    date: "2024-01-14",
    time: "10:15",
    messageCount: 8,
    preview: "Reviewed the mockups and provided suggestions...",
    status: "completed",
  },
  {
    id: "3",
    title: "Bug Report Analysis",
    date: "2024-01-13",
    time: "16:45",
    messageCount: 15,
    preview: "Analyzed the reported issues and proposed solutions...",
    status: "completed",
  },
  {
    id: "4",
    title: "Feature Requirements",
    date: "2024-01-12",
    time: "09:20",
    messageCount: 6,
    preview: "Gathered requirements for the new chat feature...",
    status: "completed",
  },
  {
    id: "5",
    title: "Performance Optimization",
    date: "2024-01-11",
    time: "13:10",
    messageCount: 20,
    preview: "Discussed ways to improve application performance...",
    status: "completed",
  },
]

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const handleDeleteChat = (chatId: string) => {
    // Handle delete functionality
    console.log("Delete chat:", chatId)
  }

  const handleOpenChat = (chatId: string) => {
    // Handle opening chat functionality
    console.log("Open chat:", chatId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm">{chat.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {chat.messageCount} messages
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{chat.preview}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {chat.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {chat.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleOpenChat(chat.id)}>
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChat(chat.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">{chatHistory.length} conversations found</p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
