"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail, MapPin, Building, ArrowUp, ArrowDown } from "lucide-react"
import { useEffect, useState } from "react"
import { getCustomerWithInvoices } from "@/app/actions/getCustomerWithInvoices"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "../theme-toggle"

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
    async function fetchCustomerData() {
      setLoading(true)
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
      setLoading(false)
    }

    fetchCustomerData()
  }, [customerId])

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
        <ThemeToggle />
      </div>

      {/* Customer Info */}
      <div className="px-6 py-6 bg-background border-b">
        <div className="flex items-start gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={customer.logoUrl || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl">
              {customer.contactName
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{customer.contactName}</h2>
              {customer.companyName && (
                <p className="text-muted-foreground">{customer.companyName}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
              )}
              
              {customer.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.address}</span>
                </div>
              )}
              
              {customer.companyDetails && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.companyDetails}</span>
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
            {filteredInvoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="hover:bg-accent"
              >
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => router.push(`/invoice-generator?id=${invoice.dbId}`)}
                >
                  {invoice.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
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
    </div>
  )
}
