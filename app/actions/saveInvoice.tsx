"use server"

import { createClient } from "@/lib/supabase/server"
import type { InvoiceData, Customers } from "@/types/invoice"

// Utility to convert camelCase keys to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/([A-Z])/g, "_$1").toLowerCase(),
        toSnakeCase(value),
      ])
    )
  }
  return obj
}

function getCustomerData(invoice: InvoiceData): Customers {
  return {
    toName: invoice.toName,
    toEmail: invoice.toEmail,
    toAddress: invoice.toAddress,
  }
}

function getCompanyData(invoice: InvoiceData) {
  return {
    companyName: invoice.companyName,
    companyLogo: invoice.companyLogo,
    companyDetails: invoice.companyDetails,
    fromName: invoice.fromName,
    fromEmail: invoice.fromEmail,
    fromAddress: invoice.fromAddress,
  }
}

function getInvoiceData(invoice: InvoiceData) {
  const {
    applyInvoiceDiscountToDiscountedItems,
    currency,
    date,
    discountType,
    discountValue,
    dueDate,
    footer,
    invoiceNumber,
    notes,
    status,
    taxRate
    // removed company and from fields
  } = invoice

  return {
    applyInvoiceDiscountToDiscountedItems,
    currency,
    date,
    discountType,
    discountValue,
    dueDate,
    footer,
    invoiceNumber,
    notes,
    status,
    taxRate
  }
}

// Save the invoice to the supabase database
export async function saveInvoice(invoice: InvoiceData) {    
  const supabase = await createClient()
  const customerData = toSnakeCase(getCustomerData(invoice));
  const invoiceData = toSnakeCase(getInvoiceData(invoice));  
  const companyData = toSnakeCase(getCompanyData(invoice));
  // Remove 'id' from each item before saving
  const lineItems = toSnakeCase(invoice["items"]).map((item: any) => {
    const { id, ...rest } = item
    return rest
  });

  let customer;
  let customerId = invoice.customerId;

  if (customerId) {
    // Update existing customer
    const { data: updatedCustomer, error: customerError } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', customerId)
      .select()
      .single();

    if (customerError) {
      return { success: false, message: customerError.message }
    }
    customer = updatedCustomer;
  } else {
    // Insert new customer
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (customerError) {
      return { success: false, message: customerError.message }
    }
    customer = newCustomer;
    customerId = newCustomer.id;
  }

  // Attach customer_id to invoiceData
  invoiceData.customer_id = customerId;

  // Save or update company info
  // Try to find existing company for this user
  const { data: existingCompany, error: companyFetchError } = await supabase
    .from('user_company')
    .select()
    .single();

  if (existingCompany) {
    // Update existing company
    const { error: companyUpdateError } = await supabase
      .from('user_company')
      .update(companyData)
      .eq('id', existingCompany.id); // use primary key instead

    if (companyUpdateError) {
      return { success: false, message: companyUpdateError.message }
    }
  } else {
    // Insert new company
    const { error: companyInsertError } = await supabase
      .from('user_company')
      .insert(companyData);

    if (companyInsertError) {
      return { success: false, message: companyInsertError.message }
    }
  }

  let invoiceResult;

  if (invoice.id) {
    // Update existing invoice
    const { data, error: invoiceError } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', invoice.id)
      .select()
      .single();

    if (invoiceError) {
      return { success: false, message: invoiceError.message }
    }
    invoiceResult = data;
  } else {
    // Insert new invoice
    const { data, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      return { success: false, message: invoiceError.message }
    }
    invoiceResult = data;
  }

  // Delete existing line items for this invoice
  await supabase
    .from('invoice_line_items')
    .delete()
    .eq('invoice_id', invoiceResult.id);

  // Insert line items with invoice_id
  const lineItemsWithInvoiceId = lineItems.map((item: any) => ({
    ...item,
    invoice_id: invoiceResult.id,
  }));

  if (lineItemsWithInvoiceId.length > 0) {
    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsWithInvoiceId);

    if (lineItemsError) {
      return { success: false, message: lineItemsError.message }
    }
  }

  return { success: true, data: invoiceResult }
}