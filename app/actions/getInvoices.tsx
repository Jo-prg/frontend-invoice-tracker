"use server"

import { createClient } from "@/lib/supabase/server"

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

  // Fetch user_company info separately (assuming one row per user)
  const { data: companyData, error: companyError } = await supabase
    .from('user_company')
    .select(`
      company_name,
      company_logo,
      company_details,
      from_name,
      from_email,
      from_address
    `)
    .single()

  if (companyError) {
    console.error('Error fetching company info:', companyError)
    // Optionally, you can still return invoices without company info
  }

  // Convert snake_case to camelCase
  const camelCaseInvoices = toCamelCase(invoices)
  const camelCaseCompany = companyData ? toCamelCase(companyData) : {}

  // Attach company info to each invoice
  const combinedInvoices = camelCaseInvoices.map((invoice: any) => ({
    ...invoice,
    companyName: camelCaseCompany.companyName || "",
    companyLogo: camelCaseCompany.companyLogo || "",
    companyDetails: camelCaseCompany.companyDetails || "",
    fromName: camelCaseCompany.fromName || "",
    fromEmail: camelCaseCompany.fromEmail || "",
    fromAddress: camelCaseCompany.fromAddress || "",
  }))

  return { success: true, data: combinedInvoices }
}
