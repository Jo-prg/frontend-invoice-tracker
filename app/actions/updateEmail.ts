"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateEmail(newEmail: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        message: "You must be logged in to update your email"
      }
    }

    const { error } = await supabase.auth.updateUser({
      email: newEmail
    })

    if (error) {
      return {
        success: false,
        message: error.message
      }
    }

    revalidatePath("/settings")

    return {
      success: true,
      message: "Email update initiated. Please check your new email for confirmation."
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update email"
    }
  }
}
