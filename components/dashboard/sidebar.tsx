"use client"

import {
  FileText,
  Home,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/login-components/logout-button"

const navigation = [
  { name: "Dashboard", icon: Home, href: "/", current: false },
  { name: "Generate Invoice", icon: FileText, href: "/invoice-generator", current: false },
  { name: "Customers", icon: Users, href: "/customers", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
]

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-background text-foreground border-r border-border max-h-screen">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-border">
        <TrendingUp className="w-6 h-6 mr-2" />
        <span className="text-lg font-semibold">Invoice Tracker</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              item.current
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </a>
        ))}
      </nav>

      {/* Logout & Theme Toggle */}
      <div className="px-4 py-4 border-t border-border">
        <LogoutButton />
      </div>
    </div>
  )
}
