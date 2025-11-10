"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Mail, MapPin, Building, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getCustomerWithInvoices } from "@/app/actions/getCustomerWithInvoices"
import { updateInvoiceStatus } from "@/app/actions/updateInvoiceStatus"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "../theme-toggle"
import { toast } from "sonner"
import { isGuestMode } from "@/lib/auth/guestMode"
import { getGuestInvoices, saveGuestInvoice } from "@/lib/auth/guestStorage"

interface CustomerDetailProps {
  customerId: string
}

interface Invoice {
  id: string
  dbId: string
  status: string
  total: string
  totalValue: number // For sorting
  date: string
  dateValue: number // For sorting
}

function getStatusColor(status: string) {
  switch (status) {
    case "Paid":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900"
    case "Delivered":
      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 hover:bg-orange-100 dark:hover:bg-orange-900"
    case "Completed":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900"
    default:
      return "bg-muted text-muted-foreground hover:bg-muted"
  }
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<any>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"status" | "total" | "date">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isGuest, setIsGuest] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  const sortInvoices = (invoicesToSort: Invoice[], sortOption: "status" | "total" | "date", direction: "asc" | "desc") => {
    const sorted = [...invoicesToSort]
    
    sorted.sort((a, b) => {
      let comparison = 0
      
      switch (sortOption) {
        case "date":
          comparison = a.dateValue - b.dateValue
          break
        case "total":
          comparison = a.totalValue - b.totalValue
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }
      
      return direction === "asc" ? comparison : -comparison
    })
    
    return sorted
  }

  const handleHeaderClick = (column: "status" | "total" | "date") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  useEffect(() => {
    const guestStatus = isGuestMode()
    setIsGuest(guestStatus)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    // Wait for guest mode to be determined before fetching
    if (!isInitialized) return

    async function fetchCustomerData() {
      setLoading(true)
      
      if (isGuest) {
        // Decode the customer ID (email) from URL
        const decodedCustomerId = decodeURIComponent(customerId)
        
        // Load from localStorage
        const guestInvoices = getGuestInvoices()
        const customerInvoices = guestInvoices.filter(
          (inv: any) => inv.toEmail === decodedCustomerId
        )
        
        if (customerInvoices.length > 0) {
          const firstInvoice = customerInvoices[0]
          setCustomer({
            toName: firstInvoice.toName,
            toEmail: firstInvoice.toEmail,
            toAddress: firstInvoice.toAddress
          })
          
          // Transform invoices
          const transformedInvoices = customerInvoices.map((invoice: any) => {
            const subtotal = invoice.items?.reduce((sum: number, item: any) => {
              const quantity = Number(item.quantity) || 0
              const price = Number(item.price) || 0
              const itemTotal = quantity * price
              
              let discountAmount = 0
              if (item.discountType === 'percentage') {
                discountAmount = itemTotal * (Number(item.discountValue) / 100)
              } else if (item.discountType === 'amount') {
                discountAmount = Number(item.discountValue) || 0
              }
              
              return sum + itemTotal - discountAmount
            }, 0) || 0

            let total = subtotal
            const invoiceDiscountValue = Number(invoice.discountValue) || 0
            
            if (invoice.discountType === 'percentage') {
              total = subtotal * (1 - invoiceDiscountValue / 100)
            } else if (invoice.discountType === 'amount') {
              total = subtotal - invoiceDiscountValue
            }

            const taxRate = Number(invoice.taxRate) || 0
            total = total * (1 + taxRate / 100)

            const invoiceDate = new Date(invoice.date)

            return {
              id: invoice.invoiceNumber,
              dbId: invoice.id,
              status: invoice.status || 'Paid',
              total: `${invoice.currency || '$'}${total.toFixed(2)}`,
              totalValue: total,
              date: invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              dateValue: invoiceDate.getTime()
            }
          })
          
          setInvoices(sortInvoices(transformedInvoices, sortBy, sortDirection))
        }
      } else {
        const result = await getCustomerWithInvoices(customerId)
        
        if (result.success && result.data) {
          setCustomer(result.data.customer)
          
          // Transform invoices
          const transformedInvoices = result.data.invoices.map((invoice: any) => {
            const subtotal = invoice.invoiceLineItems?.reduce((sum: number, item: any) => {
              const quantity = Number(item.quantity) || 0
              const price = Number(item.price) || 0
              const itemTotal = quantity * price
              
              let discountAmount = 0
              if (item.discountType === 'percentage') {
                discountAmount = itemTotal * (Number(item.discountValue) / 100)
              } else if (item.discountType === 'amount') {
                discountAmount = Number(item.discountValue) || 0
              }
              
              return sum + itemTotal - discountAmount
            }, 0) || 0

            let total = subtotal
            const invoiceDiscountValue = Number(invoice.discountValue) || 0
            
            if (invoice.discountType === 'percentage') {
              total = subtotal * (1 - invoiceDiscountValue / 100)
            } else if (invoice.discountType === 'amount') {
              total = subtotal - invoiceDiscountValue
            }

            const taxRate = Number(invoice.taxRate) || 0
            total = total * (1 + taxRate / 100)

            const invoiceDate = new Date(invoice.date)

            return {
              id: invoice.invoiceNumber,
              dbId: invoice.id,
              status: invoice.status || 'Paid',
              total: `${invoice.currency || '$'}${total.toFixed(2)}`,
              totalValue: total,
              date: invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              dateValue: invoiceDate.getTime()
            }
          })
          
          setInvoices(sortInvoices(transformedInvoices, sortBy, sortDirection))
        }
      }
      setLoading(false)
    }

    fetchCustomerData()
  }, [customerId, isGuest, isInitialized])

  useEffect(() => {
    setInvoices(prevInvoices => sortInvoices(prevInvoices, sortBy, sortDirection))
  }, [sortBy, sortDirection])

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const matchesInvoiceId = invoice.id.toLowerCase().includes(query)
    const matchesStatus = invoice.status.toLowerCase().includes(query)
    
    return matchesInvoiceId || matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, sortDirection])

  const handleStatusChange = async (invoiceDbId: string, newStatus: "Paid" | "Delivered" | "Completed") => {
    try {
      if (isGuest) {
        const guestInvoices = getGuestInvoices()
        const invoiceToUpdate = guestInvoices.find(inv => inv.id === invoiceDbId)
        
        if (invoiceToUpdate) {
          invoiceToUpdate.status = newStatus
          saveGuestInvoice(invoiceToUpdate)
          toast.success("Status updated successfully")
          setInvoices(prevInvoices => 
            prevInvoices.map(inv => 
              inv.dbId === invoiceDbId ? { ...inv, status: newStatus } : inv
            )
          )
        }
      } else {
        const result = await updateInvoiceStatus(invoiceDbId, newStatus)
        
        if (result.success) {
          toast.success("Status updated successfully")
          setInvoices(prevInvoices => 
            prevInvoices.map(inv => 
              inv.dbId === invoiceDbId ? { ...inv, status: newStatus } : inv
            )
          )
        } else {
          toast.error(result.message || "Failed to update status")
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status")
    }
  }

  const handleCreateInvoice = () => {
    const params = new URLSearchParams({
      toName: customer.toName || '',
      toEmail: customer.toEmail || '',
      toAddress: customer.toAddress || '',
    })
    router.push(`/invoice-generator?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Customer not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/customers')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Customer Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-6 py-6 bg-background border-b">
        <div className="flex items-start gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={"/placeholder.svg"} />
            <AvatarFallback className="text-2xl">
              {customer.toName
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold">{customer.toName}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.toEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.toEmail}</span>
                </div>
              )}
              
              {customer.toAddress && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.toAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Invoices ({invoices.length})</h3>
          <Input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        
        <table className="w-full">
          <thead className="bg-background border-b sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Invoice
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleHeaderClick("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortBy === "status" && (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleHeaderClick("total")}
              >
                <div className="flex items-center gap-2">
                  Total
                  {sortBy === "total" && (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleHeaderClick("date")}
              >
                <div className="flex items-center gap-2">
                  Date
                  {sortBy === "date" && (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedInvoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="hover:bg-accent"
              >
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  onClick={() => router.push(`/invoice-generator?id=${invoice.dbId}`)}
                >
                  <span className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
                    {invoice.id}
                  </span>                  
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Badge className={`${getStatusColor(invoice.status)} cursor-pointer`}>
                        {invoice.status}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.dbId, "Paid")}>
                        Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.dbId, "Delivered")}>
                        Delivered
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.dbId, "Completed")}>
                        Completed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {invoice.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {invoice.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredInvoices.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              {searchQuery ? "No invoices found matching your search." : "No invoices found for this customer."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredInvoices.length > 0 && (
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
