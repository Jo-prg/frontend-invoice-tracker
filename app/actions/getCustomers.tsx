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

export async function getCustomers() {
  const supabase = await createClient()

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('contact_name', { ascending: true })

  if (error) {
    console.error('Error fetching customers:', error)
    return { success: false, message: error.message, data: [] }
  }

  const camelCaseCustomers = toCamelCase(customers)

  return { success: true, data: camelCaseCustomers }
}
