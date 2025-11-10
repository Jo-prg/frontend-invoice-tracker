"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function deleteInvoice(invoiceId: string) {
  // Check if user is in guest mode
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest_mode')?.value === 'true'
  
  if (isGuest) {
    // For guest mode, return success - actual deletion happens client-side
    return { success: true, isGuest: true }
  }
  
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
