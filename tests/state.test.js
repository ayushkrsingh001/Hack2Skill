/**
 * State Management Tests — Validates state store, persistence, and pub/sub.
 * Tests run in Node.js with mocked localStorage.
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = String(value); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Recreate state module functions for Node.js testing
const STORAGE_KEY = 'electionAssistant_state';
const listeners = new Set();
let state = {
  user: null,
  language: 'en',
  theme: 'light',
  quizScores: [],
  chatHistory: [],
  wizardStep: 0,
  wizardData: {}
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    }
  } catch (_e) { /* ignore */ }
  return state;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_e) { /* ignore */ }
}

function getState() { return { ...state }; }

function setState(updates) {
  const prev = { ...state };
  state = { ...state, ...updates };
  saveState();
  listeners.forEach(fn => {
    try { fn(state, prev); } catch (_e) { /* ignore */ }
  });
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  listeners.clear();
  state = {
    user: null,
    language: 'en',
    theme: 'light',
    quizScores: [],
    chatHistory: [],
    wizardStep: 0,
    wizardData: {}
  };
});

describe('getState', () => {
  test('returns default state', () => {
    const s = getState();
    expect(s.user).toBeNull();
    expect(s.language).toBe('en');
    expect(s.theme).toBe('light');
    expect(s.quizScores).toEqual([]);
  });

  test('returns a shallow copy (mutation-safe)', () => {
    const s1 = getState();
    s1.user = 'hacked';
    const s2 = getState();
    expect(s2.user).toBeNull();
  });
});

describe('setState', () => {
  test('updates state partially', () => {
    setState({ language: 'hi' });
    expect(getState().language).toBe('hi');
    expect(getState().theme).toBe('light'); // unchanged
  });

  test('persists to localStorage', () => {
    setState({ theme: 'dark' });
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(saved.theme).toBe('dark');
  });

  test('notifies subscribers', () => {
    const callback = jest.fn();
    subscribe(callback);
    setState({ language: 'hi' });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].language).toBe('hi');
    expect(callback.mock.calls[0][1].language).toBe('en');
  });

  test('handles user profile update', () => {
    setState({ user: { name: 'Priya', age: 21, state: 'Delhi' } });
    const s = getState();
    expect(s.user.name).toBe('Priya');
    expect(s.user.age).toBe(21);
  });

  test('handles quiz score update', () => {
    setState({ quizScores: [{ score: 8, total: 10, date: '2026-01-01' }] });
    expect(getState().quizScores.length).toBe(1);
  });
});

describe('loadState', () => {
  test('loads from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ theme: 'dark', language: 'hi' }));
    loadState();
    expect(getState().theme).toBe('dark');
    expect(getState().language).toBe('hi');
  });

  test('handles corrupt localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('not valid json{{{');
    expect(() => loadState()).not.toThrow();
    expect(getState().language).toBe('en'); // falls back to default
  });

  test('handles empty localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    loadState();
    expect(getState().language).toBe('en');
  });

  test('merges saved state with defaults', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ theme: 'dark' }));
    loadState();
    expect(getState().theme).toBe('dark');
    expect(getState().language).toBe('en'); // default preserved
    expect(getState().quizScores).toEqual([]); // default preserved
  });
});

describe('subscribe', () => {
  test('returns an unsubscribe function', () => {
    const callback = jest.fn();
    const unsub = subscribe(callback);
    setState({ theme: 'dark' });
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
    setState({ theme: 'light' });
    expect(callback).toHaveBeenCalledTimes(1); // not called again
  });

  test('supports multiple subscribers', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    subscribe(cb1);
    subscribe(cb2);
    setState({ language: 'hi' });
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  test('handles subscriber errors gracefully', () => {
    subscribe(() => { throw new Error('subscriber error'); });
    const cb2 = jest.fn();
    subscribe(cb2);
    expect(() => setState({ theme: 'dark' })).not.toThrow();
    expect(cb2).toHaveBeenCalled();
  });
});
