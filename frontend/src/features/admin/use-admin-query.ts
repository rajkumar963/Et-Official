'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api-client';

/** Loads admin data on mount and whenever `key` changes; `reload()` refetches in place. */
export function useAdminQuery<T>(load: () => Promise<T>, key = '') {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  loadRef.current = load;
  const request = useRef(0);

  const reload = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    try {
      const result = await loadRef.current();
      if (id !== request.current) return;
      setData(result);
      setError('');
    } catch (e) {
      if (id !== request.current) return;
      setError(
        e instanceof ApiError && e.status === 403
          ? 'This account does not have admin access.'
          : (e as Error).message,
      );
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, key]);

  return { data, error, loading, reload, setData };
}
