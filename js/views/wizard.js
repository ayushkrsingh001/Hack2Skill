/**
 * Wizard View — 5-step guided flow for election process
 */
import { t } from '../i18n.js';
import { getState, setState } from '../state.js';
import { renderStepper } from '../components.js';
import { escapeHTML } from '../security.js';

const STEPS = ['wizard.step1', 'wizard.step2', 'wizard.step3', 'wizard.step4', 'wizard.step5'];

const stepContent = [
  () => `<div class="wizard-card">
    <div class="wizard-icon">✅</div>
    <h2>Voter Eligibility</h2>
    <p>To vote in Indian elections, you must meet <strong>all</strong> these criteria:</p>
    <ul class="check-list">
      <li><span class="check">✓</span> Must be an <strong>Indian citizen</strong></li>
      <li><span class="check">✓</span> Must be <strong>18 years or older</strong> (as of Jan 1 of the qualifying year)</li>
      <li><span class="check">✓</span> Must be a <strong>resident</strong> of the constituency</li>
      <li><span class="check">✓</span> Must not be <strong>disqualified</strong> under any law</li>
    </ul>
    <div class="info-box info-tip">
      <strong>💡 Tip:</strong> You can register even before turning 18 — your registration becomes active on the qualifying date.
    </div>
  </div>`,

  () => `<div class="wizard-card">
    <div class="wizard-icon">📝</div>
    <h2>Voter Registration</h2>
    <p>Register to vote through two methods:</p>
    <h3>🌐 Online (Recommended)</h3>
    <ol class="step-list">
      <li>Visit <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a></li>
      <li>Click "New Voter Registration"</li>
      <li>Fill Form 6 with personal details</li>
      <li>Upload documents (photo, age proof, address proof)</li>
      <li>Submit and save your reference number</li>
      <li>A BLO (Booth Level Officer) will verify your details</li>
    </ol>
    <h3>🏢 Offline</h3>
    <ul><li>Visit your nearest Electoral Registration Office</li>
    <li>Collect, fill, and submit Form 6 with documents</li></ul>
    <div class="info-box info-warning">
      <strong>⏱️ Note:</strong> Processing usually takes 2–4 weeks after submission.
    </div>
  </div>`,

  () => `<div class="wizard-card">
    <div class="wizard-icon">📄</div>
    <h2>Documents Required</h2>
    <h3>For Registration (Form 6):</h3>
    <ul class="doc-list">
      <li>📷 Recent passport-size photograph</li>
      <li>🎂 Age proof: Birth certificate / Class 10 marksheet / Passport / Aadhaar</li>
      <li>🏠 Address proof: Aadhaar / Utility bill / Bank passbook / Ration card</li>
    </ul>
    <h3>At the Polling Booth (any one):</h3>
    <ul class="doc-list">
      <li>🪪 Voter ID Card (EPIC) — preferred</li>
      <li>Aadhaar Card</li>
      <li>Passport / Driving License / PAN Card</li>
      <li>MNREGA Job Card</li>
      <li>Bank/Post Office Passbook with photo</li>
    </ul>
    <div class="info-box info-tip">
      <strong>💡 Tip:</strong> You can use any of 12 approved photo IDs at the booth.
    </div>
  </div>`,

  () => `<div class="wizard-card">
    <div class="wizard-icon">📍</div>
    <h2>Find Your Polling Booth</h2>
    <p>Your assigned polling station is based on your registered address.</p>
    <ol class="step-list">
      <li>Visit <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a></li>
      <li>Click "Search in Electoral Roll"</li>
      <li>Enter your name and details, or EPIC number</li>
      <li>Your booth details will be displayed</li>
    </ol>
    <div class="info-box info-tip">
      <strong>📱 Tip:</strong> Download the <strong>Voter Helpline App</strong> to check your booth location on the go.
    </div>
    <a href="#/polling" class="btn btn-primary" style="margin-top:1rem;">Open Booth Finder Map →</a>
  </div>`,

  () => `<div class="wizard-card">
    <div class="wizard-icon">🗳️</div>
    <h2>Voting Day Guide</h2>
    <p>What to expect on election day:</p>
    <ol class="step-list">
      <li><strong>Arrive at your booth</strong> — Polling hours: 7 AM to 6 PM</li>
      <li><strong>Stand in queue</strong> — Separate queues for men, women, seniors</li>
      <li><strong>Show your ID</strong> — Present Voter ID or approved photo ID</li>
      <li><strong>Get inked</strong> — Indelible ink on your left index finger</li>
      <li><strong>Cast your vote</strong> — Press the button next to your candidate on the EVM</li>
      <li><strong>Verify on VVPAT</strong> — A slip shows your choice for 7 seconds</li>
      <li><strong>Exit quietly</strong> — Do not share photos of your vote</li>
    </ol>
    <div class="info-box info-success">
      <strong>🎉 Congratulations!</strong> You've completed the guide. You're ready to vote!
    </div>
  </div>`
];

export function render() {
  const step = getState().wizardStep || 0;
  const labels = STEPS.map(k => t(k));
  return `
  <section class="view-wizard" aria-label="Step-by-step guide">
    <h1 class="view-title">${t('wizard.title')}</h1>
    ${renderStepper(labels, step)}
    <div class="wizard-body" id="wizard-body" aria-live="polite">
      ${stepContent[step]()}
    </div>
    <div class="wizard-nav">
      <button class="btn btn-outline" id="wizard-back" ${step === 0 ? 'disabled' : ''}>
        ← ${t('btn.back')}
      </button>
      <span class="wizard-progress">${step + 1} / ${STEPS.length}</span>
      <button class="btn btn-primary" id="wizard-next">
        ${step === STEPS.length - 1 ? '✓ ' + t('btn.restart') : t('btn.next') + ' →'}
      </button>
    </div>
  </section>`;
}

export function mount() {
  document.getElementById('wizard-back')?.addEventListener('click', () => {
    const step = getState().wizardStep || 0;
    if (step > 0) { setState({ wizardStep: step - 1 }); rerender(); }
  });
  document.getElementById('wizard-next')?.addEventListener('click', () => {
    const step = getState().wizardStep || 0;
    if (step < STEPS.length - 1) { setState({ wizardStep: step + 1 }); }
    else { setState({ wizardStep: 0 }); }
    rerender();
  });
}

function rerender() {
  const container = document.getElementById('app-content');
  if (container) { container.innerHTML = render(); mount(); }
}

export function unmount() { }
