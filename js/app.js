/**
 * App Controller — Main entry point
 * Initializes modules and sets up global event listeners.
 */
import { loadState, getState, setState, subscribe } from './state.js';
import { setLanguage, getLanguage, t } from './i18n.js';
import { addRoute, initRouter, navigate } from './router.js';
import { openModal, closeModal, showToast } from './components.js';
import { validateName, validateAge } from './security.js';

// Import views
import * as homeView from './views/home.js';
import * as wizardView from './views/wizard.js';
import * as chatbotView from './views/chatbot.js';
import * as timelineView from './views/timeline.js';
import * as pollingView from './views/polling.js';
import * as quizView from './views/quiz.js';

// Expose i18n for components that need it
window.__i18n = { setLanguage, getLanguage };

// ===== INDIAN STATES LIST =====
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh'
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Load persisted state
  loadState();
  const state = getState();

  // Apply saved theme
  const themeBtn = document.getElementById('themeToggle');
  if (state.theme === 'dark') {
    document.body.classList.remove('light-theme');
    if (themeBtn) themeBtn.textContent = '🌙';
  } else {
    document.body.classList.add('light-theme');
    if (themeBtn) themeBtn.textContent = '☀️';
  }

  // Apply saved language
  document.documentElement.lang = state.language || 'en';

  // Register routes
  addRoute('/', homeView);
  addRoute('/guide', wizardView);
  addRoute('/chat', chatbotView);
  addRoute('/timeline', timelineView);
  addRoute('/polling', pollingView);
  addRoute('/quiz', quizView);

  // Initialize router
  initRouter('#app-content');

  // Create background particles
  createParticles();

  // Bind global events
  bindGlobalEvents();

  // Update profile display
  updateProfileDisplay();

  // Populate state dropdown in profile modal
  populateStateDropdown();
});

function bindGlobalEvents() {
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isDark = !document.body.classList.contains('light-theme');
    setState({ theme: isDark ? 'dark' : 'light' });
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = isDark ? '🌙' : '☀️';
  });

  // Language toggle
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const newLang = getLanguage() === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = newLang === 'en' ? 'हिं' : 'EN';
    // Re-render current view
    const hash = window.location.hash;
    window.location.hash = '';
    setTimeout(() => { window.location.hash = hash || '#/'; }, 10);
  });

  // Mobile hamburger
  document.getElementById('navHamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('mobile-open');
  });

  // Close mobile menu on nav click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.nav-links')?.classList.remove('mobile-open');
    });
  });

  // Profile modal
  document.getElementById('profileBtn')?.addEventListener('click', () => openModal('profile-modal'));
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  // Profile form submission
  document.getElementById('profileForm')?.addEventListener('submit', handleProfileSubmit);

  // Keyboard: close modal on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        closeModal(m.id);
      });
    }
  });
}

function handleProfileSubmit(e) {
  e.preventDefault();
  const name = validateName(document.getElementById('profileName')?.value || '');
  const age = validateAge(document.getElementById('profileAge')?.value);
  const state = document.getElementById('profileState')?.value || '';
  const firstTime = document.querySelector('input[name="firstTime"]:checked')?.value || null;
  const registered = document.querySelector('input[name="registered"]:checked')?.value || null;

  if (!name) { showToast('Please enter a valid name.', 'warning'); return; }

  setState({
    user: { name, age, state, firstTime, registered }
  });

  closeModal('profile-modal');
  updateProfileDisplay();
  showToast(`Welcome, ${name}! 🎉`, 'success');
}

function updateProfileDisplay() {
  const user = getState().user;
  const btn = document.getElementById('profileBtn');
  if (btn && user?.name) {
    btn.innerHTML = `<span class="profile-avatar">👤</span> ${user.name}`;
  }
}

function populateStateDropdown() {
  const select = document.getElementById('profileState');
  if (!select) return;
  INDIAN_STATES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    select.appendChild(opt);
  });
}

// ===== Background Particles =====
function createParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  const colors = ['#FF9933', '#138808', '#4F46E5', '#7C3AED'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 80 + Math.random() * 180;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;background:${colors[i % 4]};animation-delay:${Math.random() * 10}s;animation-duration:${15 + Math.random() * 15}s;`;
    container.appendChild(p);
  }
}
