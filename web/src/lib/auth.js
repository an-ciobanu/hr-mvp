/**
 * POST /api/auth/logout
 * Logs out the current user by removing the session token.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function logout() {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      return { success: false, error: "Logout failed" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
