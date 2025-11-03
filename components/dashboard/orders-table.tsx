"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { MoreHorizontal, Search } from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import { useEffect, useState } from "react"
import { getInvoices } from "@/app/actions/getInvoices"
import { deleteInvoice } from "@/app/actions/deleteInvoice"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Order {
  id: string
  dbId: string
  customer: { name: string; avatar: string }
  status: string
  total: string
  date: string
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
  const router = useRouter()

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true)
      const result = await getInvoices()
      
      if (result.success && result.data) {
        // Transform invoice data to match order structure
        const transformedOrders = result.data.map((invoice: any) => {
          
          // Calculate total from line items
          const subtotal = invoice.invoiceLineItems?.reduce((sum: number, item: any) => {
            const quantity = Number(item.quantity) || 0
            const price = Number(item.price) || 0
            const itemTotal = quantity * price
            
            let discountAmount = 0
            if (item.discountType === 'percentage') {
              discountAmount = itemTotal * (Number(item.discountValue) / 100)
            } else if (item.discountType === 'fixed') {
              discountAmount = Number(item.discountValue) || 0
            }
            
            return sum + itemTotal - discountAmount
          }, 0) || 0

          // Apply invoice-level discount
          let total = subtotal
          const invoiceDiscountValue = Number(invoice.discountValue) || 0
          
          if (invoice.discountType === 'percentage') {
            total = subtotal * (1 - invoiceDiscountValue / 100)
          } else if (invoice.discountType === 'fixed') {
            total = subtotal - invoiceDiscountValue
          }

          // Apply tax
          const taxRate = Number(invoice.taxRate) || 0
          total = total * (1 + taxRate / 100)

          return {
            id: invoice.invoiceNumber,
            dbId: invoice.id,
            customer: {
              name: invoice.customers?.contactName || 'Unknown',
              avatar: invoice.customers?.logoUrl || '/placeholder.svg'
            },
            status: invoice.status || 'Paid',
            total: `${invoice.currency || '$'}${total.toFixed(2)}`,
            date: new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        })
        
        setOrders(transformedOrders)
      }
      setLoading(false)
    }

    fetchInvoices()
  }, [])

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
        <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
          <div className="flex items-center space-x-4">
            <Select defaultValue="any">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="100-500">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="$100 - $500" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100-500">$100 - $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1000</SelectItem>
                <SelectItem value="1000+">$1000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Select defaultValue="date">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-accent">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary border-border rounded focus:ring-ring"
                      />
                      <span className="ml-3 text-sm font-medium text-foreground">{order.id}</span>
                    </div>
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
                      <span className="ml-3 text-sm font-medium text-foreground">
                        {order.customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
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
