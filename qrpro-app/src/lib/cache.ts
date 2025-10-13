// Système de cache simple pour améliorer les performances
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes par défaut

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier si l'item a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Invalider le cache pour un pattern (ex: toutes les clés commençant par "orders")
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new CacheManager();

// Fonction utilitaire pour les requêtes avec cache
export async function fetchWithCache<T>(
  url: string, 
  options?: RequestInit, 
  ttl?: number
): Promise<T> {
  const cacheKey = `fetch_${url}_${JSON.stringify(options || {})}`;
  
  // Vérifier le cache d'abord
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Faire la requête
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Mettre en cache
  cache.set(cacheKey, data, ttl);
  
  return data;
}

// Clés de cache pour les différentes ressources
export const CACHE_KEYS = {
  STATS: 'admin_stats',
  ORDERS: 'admin_orders',
  USERS: 'admin_users',
  BUSINESS_CARDS: 'admin_business_cards',
  DOCUMENTS: 'admin_documents',
} as const;
