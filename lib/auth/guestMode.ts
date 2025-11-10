const GUEST_MODE_KEY = 'invoice_tracker_guest_mode';
const GUEST_SESSION_KEY = 'invoice_tracker_guest_session';

export function setGuestMode(sessionId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
}

export function isGuestMode(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(GUEST_MODE_KEY) === 'true';
  }
  return false;
}

export function getGuestSessionId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(GUEST_SESSION_KEY);
  }
  return null;
}

export function clearGuestMode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_MODE_KEY);
    localStorage.removeItem(GUEST_SESSION_KEY);
    // Also clear all guest data
    localStorage.removeItem('invoice_tracker_guest_invoices');
    localStorage.removeItem('invoice_tracker_guest_customers');
    localStorage.removeItem('invoice_tracker_guest_company');
  }
}

export function generateGuestSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
