"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "../theme-toggle"
import { useEffect, useState } from "react"
import { getCustomers } from "@/app/actions/getCustomers"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isGuestMode } from "@/lib/auth/guestMode"
import { getGuestInvoices } from "@/lib/auth/guestStorage"

interface Customer {
  id: string
  toName: string
  toEmail: string
  toAddress: string
}

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isGuest, setIsGuest] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const guestStatus = isGuestMode()
    setIsGuest(guestStatus)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    // Wait for guest mode to be determined before fetching
    if (!isInitialized) return

    async function fetchCustomers() {
      setLoading(true)
      
      if (isGuest) {
        // Extract unique customers from guest invoices
        const guestInvoices = getGuestInvoices()
        const customerMap = new Map()
        
        guestInvoices.forEach((invoice: any) => {
          if (invoice.toEmail && !customerMap.has(invoice.toEmail)) {
            customerMap.set(invoice.toEmail, {
              id: invoice.toEmail, // Use email as ID for guest mode
              toName: invoice.toName || 'Unknown',
              toEmail: invoice.toEmail,
              toAddress: invoice.toAddress || ''
            })
          }
        })
        
        setCustomers(Array.from(customerMap.values()))
      } else {
        const result = await getCustomers()
        
        if (result.success && result.data) {
          setCustomers(result.data)
        }
      }
      setLoading(false)
    }

    fetchCustomers()
  }, [isGuest, isInitialized])

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const matchesName = customer.toName?.toLowerCase().includes(query)
    const matchesEmail = customer.toEmail?.toLowerCase().includes(query)
    
    return matchesName || matchesEmail
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

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
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                className="hover:bg-accent cursor-pointer"
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={"/placeholder.svg"} />
                      <AvatarFallback>
                        {customer.toName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-3 text-sm font-medium text-foreground">
                      {customer.toName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {customer.toEmail || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {customer.toAddress || "—"}
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

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-background border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
