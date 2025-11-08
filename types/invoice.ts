export interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
  currency: string
  exchangeRate: number
  discountType: "percentage" | "amount"
  discountValue: number
}

export interface InvoiceData {
  id?: string
  customerId?: string
  invoiceNumber: string
  date: string
  dueDate: string
  companyName: string
  companyLogo: string
  companyDetails: string
  fromName: string
  fromEmail: string
  fromAddress: string
  toName: string
  toEmail: string
  toAddress: string
  items: LineItem[]
  notes: string
  taxRate: number
  currency: string
  footer: string
  discountType: "percentage" | "amount"
  discountValue: number
  applyInvoiceDiscountToDiscountedItems: boolean
  status: "Paid" | "Delivered" | "Completed" | "Unsent"
}

export interface Customers {
  toName: string
  toEmail: string
  toAddress: string
}

export interface UserCompany {
  companyName: string
  companyLogo: string
  companyDetails: string
  address: string
  fromName: string
  fromEmail: string
  fromAddress: string
}
