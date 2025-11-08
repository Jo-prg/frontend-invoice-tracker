"use server"

import { createClient } from "@/lib/supabase/server"
import type { InvoiceData } from "@/types/invoice"
import { getUserCompany } from "./getUserCompany"

export async function getInvoice(invoiceId: string) {
  const supabase = await createClient()

  // Fetch invoice, customers, and line items only
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      date,
      due_date,
      notes,
      tax_rate,
      currency,
      footer,
      discount_type,
      discount_value,
      apply_invoice_discount_to_discounted_items,
      status,
      customer_id,
      customers (
        id,
        to_name,
        to_email,
        to_address
      ),
      invoice_line_items (
        id,
        description,
        quantity,
        price,
        currency,
        exchange_rate,
        discount_type,
        discount_value
      )
    `)
    .eq('id', invoiceId)
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  if (!invoice) {
    return { success: false, message: "Invoice not found" }
  }

  // Fetch user_company info using the shared action
  const companyResult = await getUserCompany()

  if (!companyResult.success) {
    return { success: false, message: companyResult.message || "Failed to fetch company data" }
  }

  const companyData = companyResult.data || {
    companyName: "",
    companyLogo: "",
    companyDetails: "",
    fromName: "",
    fromEmail: "",
    fromAddress: "",
  }

  const customers = Array.isArray(invoice.customers) ? invoice.customers[0] : invoice.customers;

  const invoiceData: InvoiceData = {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    date: invoice.date,
    dueDate: invoice.due_date,
    companyName: companyData.companyName || "",
    companyLogo: companyData.companyLogo || "",
    companyDetails: companyData.companyDetails || "",
    fromName: companyData.fromName || "",
    fromEmail: companyData.fromEmail || "",
    fromAddress: companyData.fromAddress || "",
    toName: customers?.to_name || "",
    toEmail: customers?.to_email || "",
    toAddress: customers?.to_address || "",
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
