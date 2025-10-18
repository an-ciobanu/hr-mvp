/**
 * POST /api/auth/logout
 * Logs out the current user by removing the session token.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function logout() {
  localStorage.removeItem("token");
  return { success: true };
}
