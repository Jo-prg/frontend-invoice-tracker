"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

type InvoiceStatus = "Paid" | "Delivered" | "Completed" | "Unsent"

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  try {
    // Check if user is in guest mode
    const cookieStore = await cookies()
    const isGuest = cookieStore.get('guest_mode')?.value === 'true'
    
    if (isGuest) {
      // For guest mode, return success - actual update happens client-side
      return { success: true, data: { id: invoiceId, status }, isGuest: true }
    }
    
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId)
      .select()
      .single()

    if (error) {
      console.error("Error updating invoice status:", error)
      return { success: false, message: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating invoice status:", error)
    return { success: false, message: error.message || "Failed to update invoice status" }
  }
}
