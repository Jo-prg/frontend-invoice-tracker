"use server"

import { createClient } from "@/lib/supabase/server"

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
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
