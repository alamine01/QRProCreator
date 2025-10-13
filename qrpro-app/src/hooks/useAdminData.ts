import { useState, useEffect, useCallback } from 'react';
import { cache, fetchWithCache, CACHE_KEYS } from '@/lib/cache';

interface UseAdminDataOptions {
  enableCache?: boolean;
  cacheTTL?: number;
  refetchOnMount?: boolean;
}

// Hook pour charger les statistiques admin avec cache
export function useAdminStats(options: UseAdminDataOptions = {}) {
  const { enableCache = true, cacheTTL = 5 * 60 * 1000, refetchOnMount = false } = options;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (enableCache && !refetchOnMount) {
        data = await fetchWithCache('/api/admin/stats', {}, cacheTTL);
      } else {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        data = await response.json();
        if (enableCache) {
          cache.set(CACHE_KEYS.STATS, data, cacheTTL);
        }
      }

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enableCache, cacheTTL, refetchOnMount]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// Hook pour charger les commandes avec cache et pagination
export function useAdminOrders(options: UseAdminDataOptions & { limit?: number } = {}) {
  const { enableCache = true, cacheTTL = 2 * 60 * 1000, limit = 50 } = options;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/admin/orders${limit ? `?limit=${limit}` : ''}`;
      let data;
      
      if (enableCache) {
        data = await fetchWithCache(url, {}, cacheTTL);
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch orders');
        data = await response.json();
      }

      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enableCache, cacheTTL, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

// Hook pour charger les utilisateurs avec cache
export function useAdminUsers(options: UseAdminDataOptions & { limit?: number } = {}) {
  const { enableCache = true, cacheTTL = 5 * 60 * 1000, limit = 50 } = options;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/admin/users${limit ? `?limit=${limit}` : ''}`;
      let data;
      
      if (enableCache) {
        data = await fetchWithCache(url, {}, cacheTTL);
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch users');
        data = await response.json();
      }

      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enableCache, cacheTTL, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}

// Hook pour charger les cartes de visite avec cache
export function useAdminBusinessCards(options: UseAdminDataOptions & { limit?: number } = {}) {
  const { enableCache = true, cacheTTL = 5 * 60 * 1000, limit = 50 } = options;
  const [businessCards, setBusinessCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/admin/business-cards${limit ? `?limit=${limit}` : ''}`;
      let data;
      
      if (enableCache) {
        data = await fetchWithCache(url, {}, cacheTTL);
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch business cards');
        data = await response.json();
      }

      setBusinessCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enableCache, cacheTTL, limit]);

  useEffect(() => {
    fetchBusinessCards();
  }, [fetchBusinessCards]);

  return { businessCards, loading, error, refetch: fetchBusinessCards };
}

// Hook pour charger les documents avec cache
export function useAdminDocuments(options: UseAdminDataOptions & { limit?: number } = {}) {
  const { enableCache = true, cacheTTL = 5 * 60 * 1000, refetchOnMount = false, limit } = options;
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = limit ? `/api/admin/documents?limit=${limit}` : '/api/admin/documents';
      
      let data;
      if (enableCache && !refetchOnMount) {
        data = await fetchWithCache(url, {}, cacheTTL);
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch documents');
        data = await response.json();
        if (enableCache) {
          cache.set(CACHE_KEYS.DOCUMENTS, data, cacheTTL);
        }
      }

      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enableCache, cacheTTL, refetchOnMount, limit]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, refetch: fetchDocuments };
}

// Hook pour invalider le cache après des modifications
export function useCacheInvalidation() {
  const invalidateCache = useCallback((pattern?: string) => {
    if (pattern) {
      cache.invalidatePattern(pattern);
    } else {
      cache.clear();
    }
  }, []);

  return { invalidateCache };
}
