import type { AuthResult, UserDto, VerificationStatus } from '@et-trader/shared';
import { API_URL } from '@/config/env';
import { api } from '@/lib/api-client';

const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export const authService = {
  me: () => api<UserDto>('/auth/me'),
  signup: (data: { name: string; email: string; password: string }) =>
    post<AuthResult>('/auth/signup', data),
  login: (data: { email: string; password: string }) => post<AuthResult>('/auth/login', data),
  verification: () => api<VerificationStatus>('/auth/verification'),
  verifyEmail: (code: string) => post<AuthResult>('/auth/verify-email', { code }),
  resendVerification: () => post<VerificationStatus>('/auth/resend-verification'),
  logout: () => post('/auth/logout'),
};

/**
 * Quietly checks whether the visitor is signed in (renewing an expired access cookie once).
 * Unlike `api()`, it never redirects to /login — safe to call on public pages.
 */
export async function getSessionUser(): Promise<UserDto | null> {
  const me = () => fetch(`${API_URL}/auth/me`, { credentials: 'include', cache: 'no-store' });
  try {
    let response = await me();
    if (response.status === 401) {
      const renewed = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!renewed.ok) return null;
      response = await me();
    }
    if (!response.ok) return null;
    return ((await response.json()) as { data: UserDto }).data;
  } catch {
    return null;
  }
}

/** Where to send someone after signing in: a safe same-site `next` path, otherwise the home page. */
export function afterLoginPath(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
