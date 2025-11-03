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

  // Fetch invoices with customers and line items
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers (*),
      invoice_line_items (*)
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return { success: false, message: error.message, data: [] }
  }

  // Convert snake_case to camelCase
  const camelCaseInvoices = toCamelCase(invoices)

  return { success: true, data: camelCaseInvoices }
}
