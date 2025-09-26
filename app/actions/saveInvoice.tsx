"use server"

import { createClient } from "@/lib/supabase/server"
import type { InvoiceData } from "@/types/invoice"

// Save the invoice to the supabase database
export async function saveInvoice(invoice: InvoiceData) {    
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()

  if (error) {
    throw new Error(error.message)
  }
  return data
}