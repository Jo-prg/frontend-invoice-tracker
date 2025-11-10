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
import { useEffect, useState } from "react"
import { isGuestMode } from "@/lib/auth/guestMode"
import { createClient } from "@/lib/supabase/client"

const navigation = [
  { name: "Dashboard", icon: Home, href: "/", current: false },
  { name: "Generate Invoice", icon: FileText, href: "/invoice-generator", current: false },
  { name: "Customers", icon: Users, href: "/customers", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false, hideForGuest: true },
]

export function Sidebar() {
  const [isGuest, setIsGuest] = useState<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const guestStatus = isGuestMode()
      setIsGuest(guestStatus)
      
      // Also check if user is actually authenticated
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    
    checkAuth()
    
    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const filteredNavigation = isGuest === null 
    ? navigation 
    : navigation.filter(item => {
        // Hide settings for guest users
        if (item.hideForGuest && isGuest) {
          return false
        }
        return true
      })

  return (
    <div className="flex flex-col w-64 bg-background text-foreground border-r border-border max-h-screen">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-border">
        <TrendingUp className="w-6 h-6 mr-2" />
        <span className="text-lg font-semibold">Invoice Tracker</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {isGuest === null ? (
          // Loading state - show placeholder to maintain structure
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : (
          // Loaded state - show navigation
          filteredNavigation.map((item) => (
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
          ))
        )}
      </nav>

      {/* Logout & Theme Toggle */}
      <div className="px-4 py-4 border-t border-border">
        {isAuthenticated && <LogoutButton />}
      </div>
    </div>
  )
}
