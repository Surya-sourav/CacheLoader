# CacheDataLoader

CacheDataLoader is a small read-through cache wrapper on top of Redis.

Use one method to check Redis first, fall back to your data source on a miss, then write the fresh value back with an optional TTL.

## Usage

```ts
import {CacheLoader} from 'cachedataloader';

const cache = new CacheLoader(redisClient);

const user = await cache.get({
  key: 'user:1',
  ttl: 300,
  loader: async (key) => getUserFromDb(key)
});
```

## Behavior

- Values are serialized with `JSON.stringify` before caching.
- Cache hits return the parsed JSON value.
- TTL defaults to 60 seconds when `ttl` is omitted.

## Development

```bash
npm run build
npm run runtests
```