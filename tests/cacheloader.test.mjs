import test from 'node:test';
import assert from 'node:assert/strict';
import {CacheLoader} from '../dist/loader.js';

function createRedisMock(initialStore = new Map()) {
  const store = initialStore;
  const calls = {
    get: [],
    set: []
  };

  return {
    calls,
    store,
    async get(key) {
      calls.get.push(key);
      return store.has(key) ? store.get(key) : null;
    },
    async set(key, value, options) {
      calls.set.push({key, value, options});
      store.set(key, value);
    }
  };
}

test('returns parsed value from cache on hit', async () => {
  const redis = createRedisMock(new Map([['user:1', JSON.stringify({id: 1, name: 'Ada'})]]));
  const loader = new CacheLoader(redis);

  const result = await loader.get({
    key: 'user:1',
    loader: async () => ({id: 99, name: 'should not load'})
  });

  assert.deepEqual(result, {id: 1, name: 'Ada'});
  assert.equal(redis.calls.get.length, 1);
  assert.equal(redis.calls.set.length, 0);
});

test('loads from source and caches the value on miss', async () => {
  const redis = createRedisMock();
  const loader = new CacheLoader(redis);

  const result = await loader.get({
    key: 'product:7',
    ttl: 120,
    loader: async (key) => ({key, name: 'Keyboard', price: 49.99})
  });

  assert.deepEqual(result, {key: 'product:7', name: 'Keyboard', price: 49.99});
  assert.equal(redis.calls.get.length, 1);
  assert.equal(redis.calls.set.length, 1);
  assert.deepEqual(redis.calls.set[0], {
    key: 'product:7',
    value: JSON.stringify({key: 'product:7', name: 'Keyboard', price: 49.99}),
    options: {EX: 120}
  });
});

test('uses the default ttl when none is provided', async () => {
  const redis = createRedisMock();
  const loader = new CacheLoader(redis);

  await loader.get({
    key: 'settings:theme',
    loader: async () => ({theme: 'forest', contrast: 'high'})
  });

  assert.equal(redis.calls.set.length, 1);
  assert.deepEqual(redis.calls.set[0].options, {EX: 60});
});

test('returns null when the source loader resolves to null', async () => {
  const redis = createRedisMock();
  const loader = new CacheLoader(redis);

  const result = await loader.get({
    key: 'missing:item',
    loader: async () => null
  });

  assert.equal(result, null);
  assert.equal(redis.calls.set.length, 0);
});