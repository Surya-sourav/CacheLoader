CacheLoader is a small read-through cache wrapper on top of Redis.

Use it to keep application code simple: call one method with a cache key, a loader function, and an optional TTL. The class first checks Redis, returns the cached JSON value on a hit, and otherwise fetches from your data source, stores the result back in Redis, and returns it.

Usage:

```ts
const cache = new CacheLoader(redisClient);

const user = await cache.get({
	key: 'user:1',
	ttl: 300,
	loader: async (key) => getUserFromDb(key)
});
```

Notes:

- Values are serialized with `JSON.stringify` before being cached.
- TTL defaults to 60 seconds when `ttl` is not provided.
- The `tests/cacheloader.test.mjs` file contains runnable examples for cache hit, cache miss, and default TTL behavior.

Run the demo tests with:

```bash
npm run runtests
```
