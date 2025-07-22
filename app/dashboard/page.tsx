"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard-sidebar"
import { ProposalInterface } from "@/components/proposal-interface"
import { ChatInterface } from "@/components/chat-interface"
import { HistoryModal } from "@/components/history-modal"
import { ProfileModal } from "@/components/profile-modal"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* First Column - Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onHistoryClick={() => setHistoryModalOpen(true)}
          onProfileClick={() => setProfileModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main content area - Second and Third columns */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Second Column - Proposal Interface */}
        <div className="flex-1 lg:flex-1 overflow-hidden flex">
          <div className="flex-1">
            <ProposalInterface />
          </div>
          {/* Vertical divider for desktop */}
          <div className="hidden lg:block w-px bg-border h-auto self-stretch" />
          <div className="flex-1 lg:max-w-md xl:max-w-lg">
            <ChatInterface />
          </div>
        </div>
      </div>

      {/* Modals */}
      <HistoryModal open={historyModalOpen} onOpenChange={setHistoryModalOpen} />
      <ProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
    </div>
  )
}
