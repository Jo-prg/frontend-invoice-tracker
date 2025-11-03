import { CustomerDetail } from "@/components/customers/customer-detail"

export default function CustomerPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-screen">
      <CustomerDetail customerId={params.id} />
    </div>
  )
}
