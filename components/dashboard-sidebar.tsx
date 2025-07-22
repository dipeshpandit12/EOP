"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, User, FileText, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  onClose?: () => void
  onHistoryClick: () => void
  onProfileClick: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}


export function Sidebar({ onClose, onHistoryClick, onProfileClick, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const handleItemClick = (item: string, href: string) => {
    if (item === "History") {
      onHistoryClick();
    } else if (item === "Profile") {
      onProfileClick();
    } else if (item === "Logout") {
      handleLogout();
    } else if (href !== "#") {
      window.location.href = href;
    }
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: pathname === "/dashboard" },
    { icon: FileText, label: "History", href: "#", active: false },
    { icon: User, label: "Profile", href: "#", active: false },
    { icon: LogOut, label: "Logout", href: "#", active: false },
  ];

  return (
    <div className={`flex flex-col h-full bg-card border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">D</span>
          </div>
          {!isCollapsed && <span className="font-semibold">Dashboard</span>}
        </div>
        <div className="flex items-center gap-1">
          {/* Collapse/Expand button */}
          {onToggleCollapse && !isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleCollapse}
              className="hidden lg:flex"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {onToggleCollapse && isCollapsed && (
            <div 
              onClick={onToggleCollapse}
              className="cursor-pointer hidden lg:flex"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </div>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start gap-3'}`}
                onClick={() => handleItemClick(item.label, item.href)}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
          <Button variant="ghost" size={isCollapsed ? "icon" : "sm"} asChild title={isCollapsed ? "Home" : undefined}>
            <Link href="/">
              <Home className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Home</span>}
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
