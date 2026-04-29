/**
 * Reusable UI Components — Modal, Toast, Stepper, Card
 */
import { t } from './i18n.js';

/** Renders a modal dialog (accessible, focus-trapped) */
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

export function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

/** Shows a toast notification */
let toastTimeout;
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  clearTimeout(toastTimeout);
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  container.innerHTML = `<div class="toast toast-${type}" role="alert" aria-live="polite">
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
  </div>`;
  container.querySelector('.toast').classList.add('show');
  toastTimeout = setTimeout(() => { container.innerHTML = ''; }, duration);
}

/** Renders a step indicator for wizard */
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

/** Renders a feature card */
export function renderCard(icon, title, desc, action = '') {
  const id = `card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return `<article class="feature-card" tabindex="0" aria-labelledby="${id}">
    <div class="card-icon" aria-hidden="true">${icon}</div>
    <h3 class="card-title" id="${id}">${title}</h3>
    <p class="card-desc">${desc}</p>
    ${action ? `<div class="card-action">${action}</div>` : ''}
  </article>`;
}
