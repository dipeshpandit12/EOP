"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard-sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { HistoryModal } from "@/components/history-modal"
import { ProfileModal } from "@/components/profile-modal"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onHistoryClick={() => setHistoryModalOpen(true)}
          onProfileClick={() => setProfileModalOpen(true)}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Second column - Empty for now */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:border-r">
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Content area coming soon...</p>
            </div>
          </div>
        </div>

        {/* Third column - Chat interface */}
        <div className="flex-1 lg:flex-1 lg:max-w-md xl:max-w-lg">
          <ChatInterface />
        </div>
      </div>

      {/* Modals */}
      <HistoryModal open={historyModalOpen} onOpenChange={setHistoryModalOpen} />
      <ProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
    </div>
  )
}
