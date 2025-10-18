/**
 * GET /api/profiles/:userId
 * @param {string} userId
 * @returns {Promise<{ ok: boolean, profile?: object, error?: string }>}
 */
export async function getProfileById(userId) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  try {
    const res = await fetch(`${baseUrl}/api/profiles/${userId}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    return data;
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Network error" };
  }
}
/**
 * GET /api/users
 * @returns {Promise<{ users?: object[], error?: string }>}
 */
export async function getAllUsers() {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  try {
    const res = await fetch(`${baseUrl}/api/employees`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return data;
  } catch (e) {
    console.error(e);
    return { error: "Network error" };
  }
}

/**
 * POST /api/feedback/:userId
 * @param {string} userId
 * @param {string} body_raw
 * @returns {Promise<object>} Feedback object on success
 */
export async function postFeedback(userId, body_raw) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${baseUrl}/api/feedback/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ body_raw }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
  return data.feedback;
}
/**
 * GET /api/feedback/:userId
 * @param {string} userId
 * @returns {Promise<{ feedback?: object[], error?: string }>}
 */
export async function getFeedbackForUser(userId) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  try {
    const res = await fetch(`${baseUrl}/api/feedback/${userId}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return data;
  } catch (e) {
    console.error(e);
    return { error: "Network error" };
  }
}
/**
 * POST /api/absences
 * @param {{ start_date: string, end_date: string, reason: string }} absence
 * @returns {Promise<object>} Absence object on success
 */
export async function postAbsenceRequest({ start_date, end_date, reason }) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${baseUrl}/api/absences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ start_date, end_date, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to request absence");
  return data.absence;
}
/**
 * GET /api/absences/:userId
 * @param {string} userId
 * @returns {Promise<{ absences?: object[], error?: string }>}
 */
export async function getAbsencesForUser(userId) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  try {
    const res = await fetch(`${baseUrl}/api/absences/${userId}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return data;
  } catch (e) {
    console.error(e);
    return { error: "Network error" };
  }
}
// Centralized API client for frontend

/**
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function login(email, password) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || "Login failed" };
    }
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Network error" };
  }
}

/**
 * GET /api/profiles/me
 * @returns {Promise<{ ok: boolean, profile?: object, user?: object, error?: string }>}
 */
export async function getMyProfile() {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  try {
    const res = await fetch(`${baseUrl}/api/profiles/me`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    return data;
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Network error" };
  }
}
