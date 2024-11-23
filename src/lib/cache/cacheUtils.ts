// src/lib/cache/cacheUtils.ts

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cachePrefix = "app_cache_";
  private defaultExpiration = 1000 * 60 * 60; // 1 hour in milliseconds

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set cache with custom expiration
  setCache<T>(
    key: string,
    data: T,
    expiresIn: number = this.defaultExpiration
  ): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    try {
      localStorage.setItem(this.cachePrefix + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Error setting cache:", error);
      // If localStorage is full, clear old caches
      this.clearOldCaches();
    }
  }

  // Get cache if it exists and is not expired
  getCache<T>(key: string): T | null {
    try {
      const cachedData = localStorage.getItem(this.cachePrefix + key);

      if (!cachedData) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cachedData);

      // Check if cache is expired
      if (Date.now() - cacheItem.timestamp > cacheItem.expiresIn) {
        this.removeCache(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error("Error getting cache:", error);
      return null;
    }
  }

  // Remove specific cache
  removeCache(key: string): void {
    localStorage.removeItem(this.cachePrefix + key);
  }

  // Clear all caches
  clearAllCaches(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.cachePrefix))
      .forEach((key) => localStorage.removeItem(key));
  }

  // Clear old caches (older than expiration time)
  private clearOldCaches(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.cachePrefix))
      .forEach((key) => {
        try {
          const cachedData = localStorage.getItem(key);
          if (cachedData) {
            const cacheItem: CacheItem<any> = JSON.parse(cachedData);
            if (Date.now() - cacheItem.timestamp > cacheItem.expiresIn) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.error("Error clearing old cache:", error);
        }
      });
  }

  // Check if cache exists and is valid
  isValidCache(key: string): boolean {
    try {
      const cachedData = localStorage.getItem(this.cachePrefix + key);

      if (!cachedData) return false;

      const cacheItem: CacheItem<any> = JSON.parse(cachedData);
      return Date.now() - cacheItem.timestamp <= cacheItem.expiresIn;
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return false;
    }
  }

  // Set cache expiration time (in milliseconds)
  setDefaultExpiration(time: number): void {
    this.defaultExpiration = time;
  }
}

// Custom hook for using cache with Firebase data
export const useFirebaseCache = () => {
  const cacheManager = CacheManager.getInstance();

  const fetchWithCache = async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    expirationTime?: number
  ): Promise<T> => {
    // Check cache first
    const cachedData = cacheManager.getCache<T>(key);

    if (cachedData) {
      return cachedData;
    }

    // If no cache or expired, fetch new data
    try {
      const data = await fetchFn();
      cacheManager.setCache(key, data, expirationTime);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  return {
    fetchWithCache,
    clearCache: cacheManager.clearAllCaches.bind(cacheManager),
    removeCache: cacheManager.removeCache.bind(cacheManager),
    isValidCache: cacheManager.isValidCache.bind(cacheManager),
  };
};
