/**
 * Home View — Welcome dashboard with feature cards
 */
import { t } from '../i18n.js';
import { getState } from '../state.js';
import { renderCard } from '../components.js';

export function render() {
  const user = getState().user;
  const greeting = user?.name ? `, ${user.name}` : '';
  return `
  <section class="view-home" aria-label="Home">
    <div class="hero-section">
      <div class="hero-badge">🇮🇳 ${t('app.title')}</div>
      <h1 class="hero-title">${t('home.hero')}</h1>
      <p class="hero-subtitle">${t('home.heroSub')}</p>
      <div class="hero-actions">
        <a href="#/guide" class="btn btn-primary btn-lg" id="hero-start-guide">
          <span>🚀</span> ${t('home.feat1.title')}
        </a>
        <a href="#/chat" class="btn btn-outline btn-lg" id="hero-open-chat">
          <span>💬</span> ${t('home.feat2.title')}
        </a>
      </div>
    </div>

    <div class="stats-bar" style="margin-top: 0; margin-bottom: 3rem;">
      <div class="stat-item"><span class="stat-num">950M+</span><span class="stat-label">Eligible Voters</span></div>
      <div class="stat-item"><span class="stat-num">10L+</span><span class="stat-label">Polling Stations</span></div>
      <div class="stat-item"><span class="stat-num">543</span><span class="stat-label">Constituencies</span></div>
      <div class="stat-item"><span class="stat-num">28+8</span><span class="stat-label">States & UTs</span></div>
    </div>

    <div class="home-section">
      <div class="features-grid" id="features-grid">
        ${renderCard('📋', t('home.feat1.title'), t('home.feat1.desc'),
    `<a href="#/guide" class="card-link">Start Guide →</a>`)}
        ${renderCard('🤖', t('home.feat2.title'), t('home.feat2.desc'),
      `<a href="#/chat" class="card-link">Open Chat →</a>`)}
        ${renderCard('📅', t('home.feat3.title'), t('home.feat3.desc'),
        `<a href="#/timeline" class="card-link">View Timeline →</a>`)}
        ${renderCard('📍', t('home.feat4.title'), t('home.feat4.desc'),
          `<a href="#/polling" class="card-link">Find Booth →</a>`)}
        ${renderCard('🏆', t('home.feat5.title'), t('home.feat5.desc'),
            `<a href="#/quiz" class="card-link">Take Quiz →</a>`)}
        ${renderCard('🌐', t('home.feat6.title'), t('home.feat6.desc'),
              `<button class="card-link" id="home-lang-toggle">Switch Language</button>`)}
      </div>
    </div>

    <div class="home-section">
      <h2 class="section-title" data-i18n="home.steps.title">${t('home.steps.title')}</h2>
      <p class="section-subtitle" data-i18n="home.steps.sub">${t('home.steps.sub')}</p>
      <div class="process-steps">
        <div class="process-step">
          <div class="process-icon">✅</div>
          <h3 data-i18n="home.step1.title">${t('home.step1.title')}</h3>
          <p data-i18n="home.step1.desc">${t('home.step1.desc')}</p>
        </div>
        <div class="process-step">
          <div class="process-icon">📝</div>
          <h3 data-i18n="home.step2.title">${t('home.step2.title')}</h3>
          <p data-i18n="home.step2.desc">${t('home.step2.desc')}</p>
        </div>
        <div class="process-step">
          <div class="process-icon">🪪</div>
          <h3 data-i18n="home.step3.title">${t('home.step3.title')}</h3>
          <p data-i18n="home.step3.desc">${t('home.step3.desc')}</p>
        </div>
        <div class="process-step">
          <div class="process-icon">🗳️</div>
          <h3 data-i18n="home.step4.title">${t('home.step4.title')}</h3>
          <p data-i18n="home.step4.desc">${t('home.step4.desc')}</p>
        </div>
      </div>
    </div>

    <div class="home-section">
      <h2 class="section-title" data-i18n="home.faq.title">${t('home.faq.title')}</h2>
      <p class="section-subtitle" data-i18n="home.faq.sub">${t('home.faq.sub')}</p>
      <div class="faq-grid" id="faq-grid">
        <div class="faq-item" role="region">
          <div class="faq-question" data-i18n="home.faq1.q" aria-expanded="false" role="button" tabindex="0">${t('home.faq1.q')}</div>
          <div class="faq-answer" data-i18n="home.faq1.a" aria-hidden="true">${t('home.faq1.a')}</div>
        </div>
        <div class="faq-item" role="region">
          <div class="faq-question" data-i18n="home.faq2.q" aria-expanded="false" role="button" tabindex="0">${t('home.faq2.q')}</div>
          <div class="faq-answer" data-i18n="home.faq2.a" aria-hidden="true">${t('home.faq2.a')}</div>
        </div>
        <div class="faq-item" role="region">
          <div class="faq-question" data-i18n="home.faq3.q" aria-expanded="false" role="button" tabindex="0">${t('home.faq3.q')}</div>
          <div class="faq-answer" data-i18n="home.faq3.a" aria-hidden="true">${t('home.faq3.a')}</div>
        </div>
      </div>
    </div>
  </section>`;
}

export function mount() {
  document.getElementById('home-lang-toggle')?.addEventListener('click', () => {
    const { setLanguage, getLanguage } = window.__i18n || {};
    if (setLanguage) setLanguage(getLanguage() === 'en' ? 'hi' : 'en');
  });

  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    const toggle = () => {
      const active = item.classList.toggle('active');
      question.setAttribute('aria-expanded', active);
      answer.setAttribute('aria-hidden', !active);
    };

    question.addEventListener('click', toggle);
    question.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
}

export function unmount() { }
