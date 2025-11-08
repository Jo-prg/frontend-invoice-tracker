"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import { useEffect, useState } from "react"
import { getInvoices } from "@/app/actions/getInvoices"
import { deleteInvoice } from "@/app/actions/deleteInvoice"
import { updateInvoiceStatus } from "@/app/actions/updateInvoiceStatus"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Order {
  id: string
  dbId: string
  customer: { name: string; avatar: string; id: string; email: string }
  status: string
  total: string
  date: string
  dateValue: number // For sorting
}

function getStatusVariant(status: string) {
	switch (status) {
		case "Paid":
			return "default"
		case "Delivered":
			return "secondary"
		case "Completed":
			return "outline"
		default:
			return "default"
	}
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

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sortBy, setSortBy] = useState<"status" | "total" | "date">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const router = useRouter()

  const sortOrders = (ordersToSort: Order[], sortOption: "status" | "total" | "date", direction: "asc" | "desc") => {
    const sorted = [...ordersToSort]
    
    sorted.sort((a, b) => {
      let comparison = 0
      
      switch (sortOption) {
        case "date":
          comparison = a.dateValue - b.dateValue
          break
        case "total":
          const amountA = parseFloat(a.total.replace(/[^0-9.-]+/g, ""))
          const amountB = parseFloat(b.total.replace(/[^0-9.-]+/g, ""))
          comparison = amountA - amountB
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
    async function fetchInvoices() {
      setLoading(true)
      const result = await getInvoices()
      
      if (result.success && result.data) {
        const transformedOrders = result.data.map((invoice: any) => {
          // Calculate total from line items
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

          // Apply invoice-level discount
          let total = subtotal
          const invoiceDiscountValue = Number(invoice.discountValue) || 0
          
          if (invoice.discountType === 'percentage') {
            total = subtotal * (1 - invoiceDiscountValue / 100)
          } else if (invoice.discountType === 'amount') {
            total = subtotal - invoiceDiscountValue
          }

          // Apply tax
          const taxRate = Number(invoice.taxRate) || 0
          total = total * (1 + taxRate / 100)

          const invoiceDate = new Date(invoice.date)

          return {
            id: invoice.invoiceNumber,
            dbId: invoice.id,
            customer: {
              name: invoice.customers?.toName || 'Unknown',
              avatar: '/placeholder.svg',
              id: invoice.customers?.id || null,
              email: invoice.customers?.toEmail || ''
            },
            status: invoice.status || 'Paid',
            total: `${invoice.currency || '$'}${total.toFixed(2)}`,
            date: invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dateValue: invoiceDate.getTime()
          }
        })
        
        setOrders(sortOrders(transformedOrders, sortBy, sortDirection))
      }
      setLoading(false)
    }

    fetchInvoices()
  }, [])

  useEffect(() => {
    setOrders(prevOrders => sortOrders(prevOrders, sortBy, sortDirection))
  }, [sortBy, sortDirection])

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const matchesOrderId = order.id.toLowerCase().includes(query)
    const matchesCustomerName = order.customer.name.toLowerCase().includes(query)
    
    return matchesOrderId || matchesCustomerName
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, sortDirection])

  const handleDeleteClick = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOrderId) return

    setIsDeleting(true)
    try {
      const result = await deleteInvoice(selectedOrderId)
      
      if (result.success) {
        toast.success("Invoice deleted successfully", {
          description: "The invoice has been removed from your records.",
        })
        setOrders(orders.filter(order => order.dbId !== selectedOrderId))
      } else {
        toast.error(result.message || "Failed to delete invoice", {
          description: "There was an error deleting the invoice.",
        })
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete invoice", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedOrderId(null)
    }
  }

  const handleStatusChange = async (invoiceDbId: string, newStatus: string) => {
    try {
      const result = await updateInvoiceStatus(invoiceDbId, newStatus)
      
      if (result.success) {
        toast.success("Status updated successfully")
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.dbId === invoiceDbId ? { ...order, status: newStatus } : order
          )
        )
      } else {
        toast.error(result.message || "Failed to update status")
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Filters */}
        <div className="flex ml-auto px-6 py-4 bg-background border-b">
          <div className="flex items-center space-x-2">
            {/* Move search bar here */}
            <Input
              type="text"
              placeholder="Search orders or customers..."
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
            <thead className="bg-background border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedOrders.map((order) => (
                <tr key={order.dbId} className="hover:bg-accent">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={() => router.push(`/invoice-generator?id=${order.dbId}`)}
                    >
                      {order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={order.customer.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {order.customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span 
                        className="ml-3 text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (order.customer.id) {
                            router.push(`/customers/${order.customer.id}`)
                          }
                        }}
                      >
                        {order.customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">
                      {order.customer.email || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge className={`${getStatusColor(order.status)} cursor-pointer`}>
                          {order.status}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleStatusChange(order.dbId, "Paid")}>
                          Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.dbId, "Delivered")}>
                          Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.dbId, "Completed")}>
                          Completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/invoice-generator?id=${order.dbId}`)}>
                          Edit order
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(order.dbId)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
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

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setIsDeleting(false)
            setSelectedOrderId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
