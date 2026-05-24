const API_CACHE_NAME = 'api-cache'

const API_CACHE_URLS = ['/api/routeGroups', '/api/routes', '/api/spots', '/api/photos']

export async function invalidateApiCache(): Promise<void> {
  if (!('caches' in window)) return

  const cache = await caches.open(API_CACHE_NAME)

  await Promise.all(API_CACHE_URLS.map((url) => cache.delete(url)))
}
