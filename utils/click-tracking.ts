// utils/click-tracking.ts

/**
 * Constants for Meta click tracking
 */
export const CLICK_ID_KEY = 'fb_click_id';
export const CLICK_ID_EXPIRY_KEY = 'fb_click_id_expiry';
export const CLICK_ID_EXPIRY_DAYS = 7; // Meta recommends keeping click ID for 7 days

/**
 * Stores the Facebook Click ID (fbclid) from URL parameters into localStorage
 * with proper formatting and expiration
 */
export function storeClickId(): void {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');
  
  if (fbclid) {
    // Format according to Meta's specifications: fb.1.{timestamp}.{click_id}
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    
    // Store the click ID
    localStorage.setItem(CLICK_ID_KEY, fbc);
    
    // Set expiration date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CLICK_ID_EXPIRY_DAYS);
    localStorage.setItem(CLICK_ID_EXPIRY_KEY, expiryDate.toISOString());
  }
}

/**
 * Retrieves the stored Facebook Click ID if it exists and hasn't expired
 * @returns The stored click ID or null if not found or expired
 */
export function getStoredClickId(): string | null {
  if (typeof window === 'undefined') return null;
  
  const storedClickId = localStorage.getItem(CLICK_ID_KEY);
  const expiryDate = localStorage.getItem(CLICK_ID_EXPIRY_KEY);
  
  if (!storedClickId || !expiryDate) return null;
  
  // Check if click ID has expired
  if (new Date() > new Date(expiryDate)) {
    // Clear expired click ID
    clearStoredClickId();
    return null;
  }
  
  return storedClickId;
}

/**
 * Clears the stored click ID and its expiration date
 */
export function clearStoredClickId(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(CLICK_ID_KEY);
  localStorage.removeItem(CLICK_ID_EXPIRY_KEY);
}

/**
 * Checks if there is a valid click ID stored
 * @returns boolean indicating if a valid click ID exists
 */
export function hasValidClickId(): boolean {
  return getStoredClickId() !== null;
}