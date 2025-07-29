import { Sidebar } from "@/components/sidebar"
import { OrdersTable } from "@/components/orders-table"

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <OrdersTable />
      </main>
    </div>
  )
}
