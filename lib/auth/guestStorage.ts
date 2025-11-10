import type { InvoiceData } from "@/types/invoice"

const GUEST_INVOICES_KEY = 'invoice_tracker_guest_invoices'
const GUEST_CUSTOMERS_KEY = 'invoice_tracker_guest_customers'
const GUEST_COMPANY_KEY = 'invoice_tracker_guest_company'

export function getGuestInvoices(): InvoiceData[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(GUEST_INVOICES_KEY)
  return data ? JSON.parse(data) : []
}

export function setGuestInvoices(invoices: InvoiceData[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_INVOICES_KEY, JSON.stringify(invoices))
}

export function getGuestInvoice(invoiceId: string): InvoiceData | null {
  const invoices = getGuestInvoices()
  return invoices.find(inv => inv.id === invoiceId) || null
}

export function saveGuestInvoice(invoice: InvoiceData) {
  const invoices = getGuestInvoices()
  
  if (invoice.id) {
    // Update existing
    const index = invoices.findIndex(inv => inv.id === invoice.id)
    if (index !== -1) {
      invoices[index] = invoice
    } else {
      invoices.push(invoice)
    }
  } else {
    // Create new with generated ID
    invoice.id = `guest_inv_${Date.now()}`
    invoices.push(invoice)
  }
  
  setGuestInvoices(invoices)
  return invoice
}

export function deleteGuestInvoice(invoiceId: string) {
  const invoices = getGuestInvoices()
  const filtered = invoices.filter(inv => inv.id !== invoiceId)
  setGuestInvoices(filtered)
}

export function getGuestCustomers() {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(GUEST_CUSTOMERS_KEY)
  return data ? JSON.parse(data) : []
}

export function getGuestCompany() {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(GUEST_COMPANY_KEY)
  return data ? JSON.parse(data) : null
}

export function setGuestCompany(company: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_COMPANY_KEY, JSON.stringify(company))
}

export function clearAllGuestData() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_INVOICES_KEY)
  localStorage.removeItem(GUEST_CUSTOMERS_KEY)
  localStorage.removeItem(GUEST_COMPANY_KEY)
}
