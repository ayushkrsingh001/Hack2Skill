/**
 * Reusable UI Components — Modal, Toast, Stepper, Card.
 * Provides accessible, reusable UI primitives for the application.
 * @module components
 */
import { t } from './i18n.js';

/**
 * Renders an accessible modal dialog HTML string.
 * @param {string} id - Unique modal element ID.
 * @param {string} title - Modal title text.
 * @param {string} bodyHTML - HTML content for the modal body.
 * @returns {string} Complete modal HTML markup.
 */
export function renderModal(id, title, bodyHTML) {
  return `<div class="modal-overlay" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="${id}-title">${title}</h2>
        <button class="modal-close" data-close-modal="${id}" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
    </div>
  </div>`;
}

/**
 * Opens a modal by ID, adds focus management and keyboard handling.
 * @param {string} id - The modal element ID to open.
 */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');
  modal.querySelector('.modal-close')?.focus();
  const handleKey = e => {
    if (e.key === 'Escape') { closeModal(id); modal.removeEventListener('keydown', handleKey); }
  };
  modal.addEventListener('keydown', handleKey);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(id); }, { once: true });
}

/**
 * Closes a modal by ID.
 * @param {string} id - The modal element ID to close.
 */
export function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

/** @type {number|null} toastTimeout - Timeout ID for auto-dismissing toasts */
let toastTimeout;

/**
 * Displays a toast notification with an icon, message, and auto-dismiss.
 * @param {string} message - The message to display.
 * @param {('info'|'success'|'warning'|'error')} [type='info'] - Toast type for styling.
 * @param {number} [duration=3000] - Auto-dismiss duration in milliseconds.
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  clearTimeout(toastTimeout);
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  container.innerHTML = `<div class="toast toast-${type}" role="alert" aria-live="assertive">
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
  </div>`;
  container.querySelector('.toast').classList.add('show');
  toastTimeout = setTimeout(() => { container.innerHTML = ''; }, duration);
}

/**
 * Renders a step indicator/progress stepper for the wizard view.
 * @param {string[]} steps - Array of step label strings.
 * @param {number} currentStep - Zero-based index of the current active step.
 * @returns {string} HTML markup for the stepper component.
 */
export function renderStepper(steps, currentStep) {
  return `<div class="stepper" role="navigation" aria-label="Progress">
    ${steps.map((label, i) => `
      <div class="stepper-item ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}" 
           aria-current="${i === currentStep ? 'step' : 'false'}">
        <div class="stepper-circle">${i < currentStep ? '✓' : i + 1}</div>
        <span class="stepper-label">${label}</span>
      </div>
      ${i < steps.length - 1 ? '<div class="stepper-line"></div>' : ''}
    `).join('')}
  </div>`;
}

/**
 * Renders a feature card component with icon, title, description, and optional action.
 * @param {string} icon - Emoji or icon character.
 * @param {string} title - Card title text.
 * @param {string} desc - Card description text.
 * @param {string} [action=''] - Optional HTML for the card action area.
 * @returns {string} HTML markup for the feature card.
 */
export function renderCard(icon, title, desc, action = '') {
  const id = `card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return `<article class="feature-card" tabindex="0" aria-labelledby="${id}">
    <div class="card-icon" aria-hidden="true">${icon}</div>
    <h3 class="card-title" id="${id}">${title}</h3>
    <p class="card-desc">${desc}</p>
    ${action ? `<div class="card-action">${action}</div>` : ''}
  </article>`;
}
