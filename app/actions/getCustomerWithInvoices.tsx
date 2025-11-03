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

export async function getCustomerWithInvoices(customerId: string) {
  const supabase = await createClient()

  // Fetch customer details
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (customerError) {
    console.error('Error fetching customer:', customerError)
    return { success: false, message: customerError.message, data: null }
  }

  // Fetch invoices for this customer
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_line_items (*)
    `)
    .eq('customer_id', customerId)
    .order('date', { ascending: false })

  if (invoicesError) {
    console.error('Error fetching invoices:', invoicesError)
    return { 
      success: true, 
      data: { customer: toCamelCase(customer), invoices: [] } 
    }
  }

  return { 
    success: true, 
    data: { 
      customer: toCamelCase(customer), 
      invoices: toCamelCase(invoices) 
    } 
  }
}
