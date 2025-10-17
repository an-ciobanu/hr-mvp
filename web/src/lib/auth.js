// Simple auth util: checks if user is logged in by looking for a token cookie
export function isLoggedIn() {
  // In a real app, check for a valid cookie or user context
  return document.cookie.includes("token=");
}
