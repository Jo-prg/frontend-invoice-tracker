import { OrdersTable } from "@/components/dashboard/orders-table"
import { UserMenuServer } from "@/components/dashboard/user-menu/user-menu.server"

export default function Dashboard() {
  return (         
    <main className="flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <UserMenuServer />
      </div>
      <OrdersTable />
    </main>
  )
}
