"use server"

import { createClient } from "@/lib/supabase/server"

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient()

  // Delete line items first (due to foreign key constraint)
  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .delete()
    .eq('invoice_id', invoiceId)

  if (lineItemsError) {
    return { success: false, message: lineItemsError.message }
  }

  // Delete the invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)

  if (invoiceError) {
    return { success: false, message: invoiceError.message }
  }

  return { success: true }
}
