/**
 * Client-Side Authentication & Session Persistence Helper
 * Ensures session resilience across page refreshes, Vercel serverless cold-starts,
 * and role transitions.
 */

export function getSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sgip_session_user_id');
}

export function getSessionRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sgip_session_role');
}

export function setSessionUser(user: { id: string; role: string; name?: string; email?: string }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sgip_session_user_id', user.id);
  localStorage.setItem('sgip_session_role', user.role);
  localStorage.setItem('sgip_session_user', JSON.stringify(user));
  
  // Also store in document.cookie for immediate availability in browser requests
  document.cookie = `sgip_session_user_id=${user.id}; path=/; max-age=2592000; SameSite=Lax`;
  document.cookie = `sgip_session_role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sgip_session_user_id');
  localStorage.removeItem('sgip_session_role');
  localStorage.removeItem('sgip_session_user');
  
  document.cookie = `sgip_session_user_id=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `sgip_session_role=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Universal authenticated fetch:
 * Attaches the x-user-id header automatically from active session
 * so serverless functions know the exact logged-in persona immediately.
 */
export function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const userId = getSessionUserId();
  const headers = new Headers(init?.headers);
  if (userId && !headers.has('x-user-id')) {
    headers.set('x-user-id', userId);
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: 'include'
  });
}
