"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePassword(newPassword: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        message: "You must be logged in to update your password"
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
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
      message: "Password updated successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update password"
    }
  }
}
