import type { ApiResponse } from '@et-trader/shared';
import { API_URL } from '@/config/env';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshing: Promise<boolean> | null = null;

/** Reads a JSON body without throwing on empty or non-JSON responses (e.g. proxy error pages). */
async function readBody(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the API. Make sure the backend is running.');
  }
  if (response.status === 401 && retry && (!path.startsWith('/auth/') || path === '/auth/me')) {
    refreshing ??= fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
    if (await refreshing) return api<T>(path, options, false);
    if (typeof window !== 'undefined') {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    }
  }
  const result = await readBody(response);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      result?.error?.message || `Request failed (${response.status})`,
    );
  }
  return (result as ApiResponse<T> | null)?.data as T;
}
