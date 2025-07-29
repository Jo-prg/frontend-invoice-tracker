"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search } from "lucide-react"

const orders = [
  {
    id: "#380561",
    customer: { name: "Michelle Black", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$780.00",
    date: "Jan 8",
  },
  {
    id: "#663334",
    customer: { name: "Janice Chandler", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Delivered",
    total: "$1,250.00",
    date: "Jan 6",
  },
  {
    id: "#418135",
    customer: { name: "Mildred Hall", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$540.95",
    date: "Jan 5",
  },
  {
    id: "#801939",
    customer: { name: "Ana Carter", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$1,488.00",
    date: "Jan 2",
  },
  {
    id: "#517783",
    customer: { name: "John Sherman", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Completed",
    total: "$925.00",
    date: "Dec 28",
  },
  {
    id: "#602992",
    customer: { name: "James Miller", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$1,620.00",
    date: "Dec 26",
  },
  {
    id: "#730345",
    customer: { name: "Travis French", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$315.50",
    date: "Dec 22",
  },
  {
    id: "#126955",
    customer: { name: "Ralph Hall", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$1,387.45",
    date: "Dec 20",
  },
  {
    id: "#045321",
    customer: { name: "Gary Gilbert", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Completed",
    total: "$297.00",
    date: "Dec 18",
  },
  {
    id: "#062848",
    customer: { name: "Frances Howell", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Delivered",
    total: "$1,794.00",
    date: "Dec 17",
  },
  {
    id: "#545072",
    customer: { name: "Herbert Boyd", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$714.00",
    date: "Dec 14",
  },
  {
    id: "#432019",
    customer: { name: "Alan White", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Paid",
    total: "$267.65",
    date: "Dec 13",
  },
  {
    id: "#885927",
    customer: { name: "Julie Martin", avatar: "/placeholder.svg?height=32&width=32" },
    status: "Delivered",
    total: "$389.00",
    date: "Dec 11",
  },
]

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
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "Delivered":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100"
    case "Completed":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export function OrdersTable() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>KE</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">Kristina Evans</div>
              <div className="text-gray-500">kristina@gmail.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
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
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">{order.id}</span>
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
                    <span className="ml-3 text-sm font-medium text-gray-900">{order.customer.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit order</DropdownMenuItem>
                      <DropdownMenuItem>Delete order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
