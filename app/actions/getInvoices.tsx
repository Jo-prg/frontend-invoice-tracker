"use server"

import { createClient } from "@/lib/supabase/server"
import { getUserCompany } from "./getUserCompany"

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

export async function getInvoices() {
  const supabase = await createClient()

  // Fetch invoices with customers and line items only
  const { data: invoices, error } = await supabase
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
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return { success: false, message: error.message, data: [] }
  }

  // Fetch user_company info using the shared action
  const companyResult = await getUserCompany()
  const companyData = companyResult.success && companyResult.data ? companyResult.data : {
    companyName: "",
    companyLogo: "",
    companyDetails: "",
    fromName: "",
    fromEmail: "",
    fromAddress: "",
  }

  // Convert snake_case to camelCase
  const camelCaseInvoices = toCamelCase(invoices)

  // Attach company info to each invoice
  const combinedInvoices = camelCaseInvoices.map((invoice: any) => ({
    ...invoice,
    companyName: companyData.companyName || "",
    companyLogo: companyData.companyLogo || "",
    companyDetails: companyData.companyDetails || "",
    fromName: companyData.fromName || "",
    fromEmail: companyData.fromEmail || "",
    fromAddress: companyData.fromAddress || "",
  }))

  return { success: true, data: combinedInvoices }
}
