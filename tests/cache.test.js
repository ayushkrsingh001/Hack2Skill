const { getCache, setCache, clearCache } = require('../server/utils/cache');

describe('Cache Utility', () => {
  beforeEach(() => {
    clearCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('set and get item', () => {
    setCache('key1', 'value1');
    expect(getCache('key1')).toBe('value1');
  });

  test('returns null for missing key', () => {
    expect(getCache('missing')).toBeNull();
  });

  test('expires item after TTL', () => {
    // Set cache with 1 second TTL
    setCache('key2', 'value2', 1);
    expect(getCache('key2')).toBe('value2');

    // Advance time by 2 seconds
    jest.advanceTimersByTime(2000);

    expect(getCache('key2')).toBeNull();
  });

  test('clearCache removes all items', () => {
    setCache('k1', 'v1');
    setCache('k2', 'v2');
    clearCache();
    expect(getCache('k1')).toBeNull();
    expect(getCache('k2')).toBeNull();
  });
});
