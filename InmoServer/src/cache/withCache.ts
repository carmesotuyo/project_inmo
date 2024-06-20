import CacheModule from './cacheModule';

export async function getFromCache<T>(cache: CacheModule, keyGenerator: (id: any) => string, id: any): Promise<T | null> {
  const key = keyGenerator(id);
  const cachedData = await cache.get(key);
  return cachedData ? (JSON.parse(cachedData) as T) : null;
}

export async function saveToCache<T>(cache: CacheModule, keyGenerator: (id: any) => string, ttl: number, data: T, id: any): Promise<void> {
  const key = keyGenerator(id);
  await cache.set(key, JSON.stringify(data), ttl);
}

export async function fetchAndCache<T>(cache: CacheModule, keyGenerator: (id: any) => string, ttl: number, id: any, fetchFromDb: (id: any) => Promise<T | null>): Promise<T> {
  let data = await getFromCache<T>(cache, keyGenerator, id);
  if (data) {
    console.log(`Data for ${id} obtained from cache`);
    return data;
  }

  data = await fetchFromDb(id);
  if (!data) throw new Error(`Data for ${id} not found`);
  console.log(`Data for ${id} obtained from database`);
  await saveToCache(cache, keyGenerator, ttl, data, id);

  return data;
}

export async function fetchAndCacheExistence<T>(cache: CacheModule, keyGenerator: (id: any) => string, ttl: number, id: any, fetchFromDb: (id: any) => Promise<T | null>): Promise<boolean> {
  let data = await getFromCache<T>(cache, keyGenerator, id);
  if (data !== null) return true;

  data = await fetchFromDb(id);
  if (!data) return false;
  await saveToCache(cache, keyGenerator, ttl, data, id);
  return true;
}
