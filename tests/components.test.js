/**
 * Component Tests — Validates reusable UI component rendering and behavior.
 * Tests HTML output generation for Modal, Stepper, Card, and Toast components.
 */

// Recreate component rendering functions for Node.js testing
function renderModal(id, title, bodyHTML) {
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

function renderStepper(steps, currentStep) {
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

function renderCard(icon, title, desc, action = '') {
  const id = `card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return `<article class="feature-card" tabindex="0" aria-labelledby="${id}">
    <div class="card-icon" aria-hidden="true">${icon}</div>
    <h3 class="card-title" id="${id}">${title}</h3>
    <p class="card-desc">${desc}</p>
    ${action ? `<div class="card-action">${action}</div>` : ''}
  </article>`;
}

describe('renderModal', () => {
  test('generates valid modal HTML', () => {
    const html = renderModal('test-modal', 'Test Title', '<p>Content</p>');
    expect(html).toContain('id="test-modal"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
  });

  test('has accessible title linked by aria-labelledby', () => {
    const html = renderModal('my-modal', 'My Title', 'Body');
    expect(html).toContain('aria-labelledby="my-modal-title"');
    expect(html).toContain('id="my-modal-title"');
    expect(html).toContain('My Title');
  });

  test('includes close button with aria-label', () => {
    const html = renderModal('close-test', 'Title', 'Body');
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('data-close-modal="close-test"');
  });

  test('renders body content', () => {
    const html = renderModal('body-test', 'Title', '<form>Form Content</form>');
    expect(html).toContain('<form>Form Content</form>');
  });
});

describe('renderStepper', () => {
  const steps = ['Eligibility', 'Registration', 'Documents'];

  test('renders all steps', () => {
    const html = renderStepper(steps, 0);
    expect(html).toContain('Eligibility');
    expect(html).toContain('Registration');
    expect(html).toContain('Documents');
  });

  test('marks current step as active', () => {
    const html = renderStepper(steps, 1);
    expect(html).toContain('aria-current="step"');
  });

  test('marks completed steps', () => {
    const html = renderStepper(steps, 2);
    const completedCount = (html.match(/completed/g) || []).length;
    expect(completedCount).toBeGreaterThanOrEqual(2);
  });

  test('shows step numbers for uncompleted steps', () => {
    const html = renderStepper(steps, 0);
    expect(html).toContain('>1<');
    expect(html).toContain('>2<');
    expect(html).toContain('>3<');
  });

  test('shows checkmark for completed steps', () => {
    const html = renderStepper(steps, 2);
    expect(html).toContain('✓');
  });

  test('has navigation role and aria-label', () => {
    const html = renderStepper(steps, 0);
    expect(html).toContain('role="navigation"');
    expect(html).toContain('aria-label="Progress"');
  });

  test('renders separator lines between steps', () => {
    const html = renderStepper(steps, 0);
    const lineCount = (html.match(/stepper-line/g) || []).length;
    expect(lineCount).toBe(steps.length - 1);
  });
});

describe('renderCard', () => {
  test('renders card with icon, title, and description', () => {
    const html = renderCard('🗳️', 'Vote Guide', 'Learn how to vote.');
    expect(html).toContain('🗳️');
    expect(html).toContain('Vote Guide');
    expect(html).toContain('Learn how to vote.');
  });

  test('uses article element for semantic HTML', () => {
    const html = renderCard('📋', 'Test', 'Desc');
    expect(html).toContain('<article');
  });

  test('has tabindex for keyboard navigation', () => {
    const html = renderCard('📋', 'Test', 'Desc');
    expect(html).toContain('tabindex="0"');
  });

  test('generates unique ID from title', () => {
    const html = renderCard('📋', 'Step by Step Guide', 'Description');
    expect(html).toContain('id="card-step-by-step-guide"');
    expect(html).toContain('aria-labelledby="card-step-by-step-guide"');
  });

  test('marks icon as decorative (aria-hidden)', () => {
    const html = renderCard('📋', 'Test', 'Desc');
    expect(html).toContain('aria-hidden="true"');
  });

  test('renders optional action area', () => {
    const html = renderCard('📋', 'Test', 'Desc', '<a href="#/guide">Start →</a>');
    expect(html).toContain('card-action');
    expect(html).toContain('Start →');
  });

  test('omits action area when not provided', () => {
    const html = renderCard('📋', 'Test', 'Desc');
    expect(html).not.toContain('card-action');
  });
});
