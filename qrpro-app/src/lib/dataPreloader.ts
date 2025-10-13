import { cache, CACHE_KEYS } from '@/lib/cache';

// Système de préchargement des données
export class DataPreloader {
  private static instance: DataPreloader;
  private preloadPromises = new Map<string, Promise<any>>();

  static getInstance(): DataPreloader {
    if (!DataPreloader.instance) {
      DataPreloader.instance = new DataPreloader();
    }
    return DataPreloader.instance;
  }

  // Précharger les données admin
  async preloadAdminData(): Promise<void> {
    const preloadTasks = [
      this.preloadStats(),
      this.preloadOrders(),
      this.preloadUsers(),
      this.preloadBusinessCards()
    ];

    // Exécuter toutes les tâches en parallèle
    await Promise.allSettled(preloadTasks);
  }

  private async preloadStats(): Promise<void> {
    const cacheKey = 'preload_stats';
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey);
    }

    const promise = this.fetchWithRetry('/api/admin/stats', {}, 5 * 60 * 1000);
    this.preloadPromises.set(cacheKey, promise);
    
    try {
      await promise;
    } finally {
      this.preloadPromises.delete(cacheKey);
    }
  }

  private async preloadOrders(): Promise<void> {
    const cacheKey = 'preload_orders';
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey);
    }

    const promise = this.fetchWithRetry('/api/admin/orders?limit=20', {}, 2 * 60 * 1000);
    this.preloadPromises.set(cacheKey, promise);
    
    try {
      await promise;
    } finally {
      this.preloadPromises.delete(cacheKey);
    }
  }

  private async preloadUsers(): Promise<void> {
    const cacheKey = 'preload_users';
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey);
    }

    const promise = this.fetchWithRetry('/api/admin/users?limit=20', {}, 5 * 60 * 1000);
    this.preloadPromises.set(cacheKey, promise);
    
    try {
      await promise;
    } finally {
      this.preloadPromises.delete(cacheKey);
    }
  }

  private async preloadBusinessCards(): Promise<void> {
    const cacheKey = 'preload_business_cards';
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey);
    }

    const promise = this.fetchWithRetry('/api/admin/business-cards?limit=20', {}, 5 * 60 * 1000);
    this.preloadPromises.set(cacheKey, promise);
    
    try {
      await promise;
    } finally {
      this.preloadPromises.delete(cacheKey);
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit, ttl: number, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Mettre en cache
        const cacheKey = `fetch_${url}_${JSON.stringify(options || {})}`;
        cache.set(cacheKey, data, ttl);
        
        return data;
      } catch (error) {
        if (i === retries - 1) {
          console.warn(`Échec du préchargement pour ${url} après ${retries} tentatives:`, error);
          throw error;
        }
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  // Précharger les données pour une page spécifique
  async preloadPageData(page: 'dashboard' | 'orders' | 'users' | 'business-cards' | 'statistics'): Promise<void> {
    switch (page) {
      case 'dashboard':
        await Promise.all([
          this.preloadStats(),
          this.preloadOrders(),
          this.preloadUsers()
        ]);
        break;
      case 'orders':
        await this.preloadOrders();
        break;
      case 'users':
        await this.preloadUsers();
        break;
      case 'business-cards':
        await this.preloadBusinessCards();
        break;
      case 'statistics':
        await Promise.all([
          this.preloadStats(),
          this.preloadOrders(),
          this.preloadUsers(),
          this.preloadBusinessCards()
        ]);
        break;
    }
  }
}

// Hook pour utiliser le préchargement
export function useDataPreloader() {
  const preloader = DataPreloader.getInstance();

  const preloadAdminData = () => preloader.preloadAdminData();
  const preloadPageData = (page: Parameters<typeof preloader.preloadPageData>[0]) => 
    preloader.preloadPageData(page);

  return { preloadAdminData, preloadPageData };
}
