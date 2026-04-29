/**
 * State Management Module — Centralized pub/sub state store
 * Provides reactive state with localStorage persistence.
 */

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

/** Load state from localStorage */
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return state;
}

/** Save state to localStorage */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

/** Get current state (returns shallow copy) */
export function getState() {
  return { ...state };
}

/** Update state and notify listeners */
export function setState(updates) {
  const prev = { ...state };
  state = { ...state, ...updates };
  saveState();
  listeners.forEach(fn => {
    try { fn(state, prev); } catch (e) { console.error('State listener error:', e); }
  });
}

/** Subscribe to state changes, returns unsubscribe function */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
