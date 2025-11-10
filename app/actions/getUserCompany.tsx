"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

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

export async function getUserCompany() {
  // Check if user is in guest mode
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest_mode')?.value === 'true'
  
  if (isGuest) {
    // Return empty company data - client will handle guest storage
    return {
      success: true,
      data: {
        companyName: "",
        companyLogo: "",
        companyDetails: "",
        fromName: "",
        fromEmail: "",
        fromAddress: "",
      },
      isGuest: true
    }
  }
  
  const supabase = await createClient()

  const { data: companyData, error } = await supabase
    .from('user_company')
    .select(`
      company_name,
      company_logo,
      company_details,
      from_name,
      from_email,
      from_address
    `)
    .single()

  if (error) {
    // If no company data exists yet, return empty fields
    if (error.code === 'PGRST116') {
      return {
        success: true,
        data: {
          companyName: "",
          companyLogo: "",
          companyDetails: "",
          fromName: "",
          fromEmail: "",
          fromAddress: "",
        }
      }
    }
    return { success: false, message: error.message }
  }

  const camelCaseCompany = toCamelCase(companyData)

  return {
    success: true,
    data: {
      companyName: camelCaseCompany.companyName || "",
      companyLogo: camelCaseCompany.companyLogo || "",
      companyDetails: camelCaseCompany.companyDetails || "",
      fromName: camelCaseCompany.fromName || "",
      fromEmail: camelCaseCompany.fromEmail || "",
      fromAddress: camelCaseCompany.fromAddress || "",
    }
  }
}
