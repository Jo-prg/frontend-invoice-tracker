"use server"

import { createClient } from "@/lib/supabase/server"
import type { InvoiceData } from "@/types/invoice"

// Utility to convert snake_case keys to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        toCamelCase(value),
      ])
    )
  }
  return obj
}

export async function getInvoice(invoiceId: string) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers (*),
      invoice_line_items (*)
    `)
    .eq('id', invoiceId)
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  if (!invoice) {
    return { success: false, message: "Invoice not found" }
  }

  // Transform database structure to InvoiceData format
  const invoiceData: InvoiceData = {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    date: invoice.date,
    dueDate: invoice.due_date,
    companyName: invoice.customers?.company_name || "",
    companyLogo: invoice.customers?.logo_url || "",
    companyDetails: invoice.customers?.company_details || "",
    fromName: invoice.from_name,
    fromEmail: invoice.from_email,
    fromAddress: invoice.from_address,
    toName: invoice.customers?.contact_name || "",
    toEmail: invoice.customers?.email || "",
    toAddress: invoice.customers?.address || "",
    items: invoice.invoice_line_items?.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
      exchangeRate: item.exchange_rate,
      discountType: item.discount_type,
      discountValue: item.discount_value,
    })) || [],
    notes: invoice.notes || "",
    taxRate: invoice.tax_rate,
    currency: invoice.currency,
    footer: invoice.footer || "",
    discountType: invoice.discount_type,
    discountValue: invoice.discount_value,
    applyInvoiceDiscountToDiscountedItems: invoice.apply_invoice_discount_to_discounted_items,
    status: invoice.status,
    customerId: invoice.customer_id,
  }

  return { success: true, data: invoiceData }
}
