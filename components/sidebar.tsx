"use client"

import {
  FileText,
  Home,
  LogOut,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", icon: Home, href: "/", current: false },
  { name: "Generate Invoice", icon: FileText, href: "/invoice-generator", current: false },
  { name: "Customers", icon: Users, href: "/customers", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
]

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-slate-700">
        <TrendingUp className="w-6 h-6 mr-2" />
        <span className="text-lg font-semibold">ProfitPulse</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              item.current ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </a>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-700">
        <a
          href="#"
          className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log out
        </a>
      </div>
    </div>
  )
}
