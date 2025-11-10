"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function uploadLogo(base64Image: string, fileName: string = 'company-logo') {
  // Check if user is in guest mode
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest_mode')?.value === 'true'
  
  if (isGuest) {
    // For guest mode, just return the base64 string as the "url"
    return { success: true, url: base64Image, isGuest: true }
  }
  
  const supabase = await createClient()

  try {
    // Convert base64 to blob
    const base64Data = base64Image.split(',')[1]
    const mimeType = base64Image.split(',')[0].match(/:(.*?);/)?.[1] || 'image/png'
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Generate unique filename
    const timestamp = Date.now()
    const extension = mimeType.split('/')[1]
    const uniqueFileName = `${fileName}-${timestamp}.${extension}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('invoice-tracker-bucket')
      .upload(`logos/${uniqueFileName}`, buffer, {
        contentType: mimeType,
        upsert: false
      })

    if (error) {
      return { success: false, message: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('invoice-tracker-bucket')
      .getPublicUrl(`logos/${uniqueFileName}`)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to upload logo' }
  }
}

export async function deleteLogo(url: string) {
  // Check if user is in guest mode
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest_mode')?.value === 'true'
  
  if (isGuest) {
    // For guest mode, nothing to delete from server
    return { success: true, isGuest: true }
  }
  
  const supabase = await createClient()

  try {
    // Extract file path from URL
    const urlParts = url.split('/invoice-tracker-bucket/')
    if (urlParts.length < 2) {
      return { success: false, message: 'Invalid logo URL' }
    }

    const filePath = urlParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from('invoice-tracker-bucket')
      .remove([filePath])

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete logo' }
  }
}
