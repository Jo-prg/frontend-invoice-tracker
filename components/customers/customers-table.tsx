"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "../theme-toggle"
import { useEffect, useState } from "react"
import { getCustomers } from "@/app/actions/getCustomers"
import { useRouter } from "next/navigation"

interface Customer {
  id: string
  contactName: string
  email: string
  address: string
  logoUrl?: string
  companyName?: string
}

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true)
      const result = await getCustomers()
      
      if (result.success && result.data) {
        setCustomers(result.data)
      }
      setLoading(false)
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const matchesName = customer.contactName?.toLowerCase().includes(query)
    const matchesEmail = customer.email?.toLowerCase().includes(query)
    
    return matchesName || matchesEmail
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-background">
        <table className="w-full">
          <thead className="bg-background border-b sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Company
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                className="hover:bg-accent cursor-pointer"
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={customer.logoUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        {customer.contactName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-3 text-sm font-medium text-foreground">
                      {customer.contactName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {customer.email || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {customer.address || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {customer.companyName || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              {searchQuery ? "No customers found matching your search." : "No customers yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
