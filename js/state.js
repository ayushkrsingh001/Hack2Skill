/**
 * State Management Module — Centralized pub/sub state store.
 * Provides reactive state with localStorage persistence.
 * @module state
 */

/** @constant {string} STORAGE_KEY - localStorage key for persisted state */
const STORAGE_KEY = 'electionAssistant_state';

/** @type {Set<Function>} listeners - Set of subscriber callbacks */
const listeners = new Set();

/** @type {object} state - Application state object */
let state = {
  user: null,
  language: 'en',
  theme: 'light',
  quizScores: [],
  chatHistory: [],
  wizardStep: 0,
  wizardData: {}
};

/**
 * Load state from localStorage. Merges saved state with defaults.
 * @returns {object} The current state after loading.
 */
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    }
  } catch (_e) {
    /* localStorage unavailable or corrupt — use defaults */
  }
  return state;
}

/**
 * Save current state to localStorage.
 * @private
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_e) {
    /* localStorage unavailable — state will not persist */
  }
}

/**
 * Get the current state (returns a shallow copy to prevent direct mutation).
 * @returns {object} A shallow copy of the current state.
 */
export function getState() {
  return { ...state };
}

/**
 * Update state with the given partial object and notify all subscribers.
 * @param {object} updates - Partial state object to merge.
 */
export function setState(updates) {
  const prev = { ...state };
  state = { ...state, ...updates };
  saveState();
  listeners.forEach(fn => {
    try { fn(state, prev); } catch (_e) { /* silent listener error */ }
  });
}

/**
 * Subscribe to state changes. Returns an unsubscribe function.
 * @param {Function} fn - Callback invoked with (newState, prevState) on each change.
 * @returns {Function} Unsubscribe function.
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
