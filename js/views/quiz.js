/**
 * Quiz View — Gamified election knowledge quiz with scoring and badges
 */
import { t } from '../i18n.js';
import { getState, setState } from '../state.js';
import { showToast } from '../components.js';

const questions = [
  { q: 'What is the minimum voting age in India?', options: ['16 years', '18 years', '21 years', '25 years'], answer: 1 },
  { q: 'Which body conducts elections in India?', options: ['Supreme Court', 'Parliament', 'Election Commission of India', 'NITI Aayog'], answer: 2 },
  { q: 'What is the full form of EVM?', options: ['Electronic Voting Machine', 'Electric Vote Maker', 'Election Verification Module', 'Electronic Vote Manager'], answer: 0 },
  { q: 'What is VVPAT?', options: ['Voter Verification And Processing Tool', 'Voter Verifiable Paper Audit Trail', 'Vote Validity And Print Token', 'Verified Voter Authenticity Protocol'], answer: 1 },
  { q: 'Which form is used for new voter registration?', options: ['Form 1', 'Form 6', 'Form 8', 'Form 12'], answer: 1 },
  { q: 'How many Lok Sabha constituencies are there in India?', options: ['435', '500', '543', '600'], answer: 2 },
  { q: 'When does election campaigning stop before polling day?', options: ['24 hours', '48 hours', '72 hours', '12 hours'], answer: 1 },
  { q: 'What is the indelible ink applied on?', options: ['Right thumb', 'Left index finger', 'Right index finger', 'Left thumb'], answer: 1 },
  { q: 'What is EPIC?', options: ['Election Process Information Card', 'Electors Photo Identity Card', 'Electronic Polling Identity Certificate', 'Election Participation ID Card'], answer: 1 },
  { q: 'Who appoints the Chief Election Commissioner?', options: ['Prime Minister', 'Parliament', 'President of India', 'Supreme Court'], answer: 2 },
  { q: 'What is the NOTA option on EVM?', options: ['Not On Time Attendance', 'None Of The Above', 'National Online Tally Account', 'Nomination Of Total Abstainers'], answer: 1 },
  { q: 'Which article of the Constitution establishes the Election Commission?', options: ['Article 280', 'Article 324', 'Article 352', 'Article 370'], answer: 1 },
];

let currentQ = 0, score = 0, answered = false, timer = null, timeLeft = 15;
let shuffledQuestions = [];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getBadge(score, total) {
  const pct = (score / total) * 100;
  if (pct >= 80) return { emoji: '🏆', label: t('quiz.badge.expert'), color: '#f59e0b' };
  if (pct >= 50) return { emoji: '🥈', label: t('quiz.badge.intermediate'), color: '#818cf8' };
  return { emoji: '🥉', label: t('quiz.badge.beginner'), color: '#64748b' };
}

function renderQuestion() {
  const total = Math.min(shuffledQuestions.length, 10);
  if (currentQ >= total) return renderComplete(total);
  const qData = shuffledQuestions[currentQ];
  answered = false; timeLeft = 15;

  return `
    <div class="quiz-progress">
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(currentQ / total) * 100}%"></div></div>
      <span>${t('quiz.question')} ${currentQ + 1}/${total}</span>
      <span class="quiz-timer" id="quiz-timer">⏱️ ${timeLeft}s</span>
    </div>
    <div class="quiz-question-card">
      <h2 class="quiz-question">${qData.q}</h2>
      <div class="quiz-options" id="quiz-options" role="radiogroup" aria-label="Select the correct answer">
        ${qData.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}" role="radio" aria-checked="false" tabindex="0" aria-label="Option ${String.fromCharCode(65 + i)}: ${opt}">
            <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
            <span class="option-text">${opt}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <div class="quiz-score-bar">
      <span>🎯 ${t('quiz.score')}: <strong>${score}</strong></span>
    </div>`;
}

function renderComplete(total) {
  const badge = getBadge(score, total);
  const state = getState();
  const scores = [...(state.quizScores || []), { score, total, date: new Date().toISOString() }];
  setState({ quizScores: scores });

  return `
    <div class="quiz-complete">
      <div class="quiz-badge" style="color:${badge.color}">${badge.emoji}</div>
      <h2>${t('quiz.complete')}</h2>
      <p class="quiz-final-score">${t('quiz.yourScore')}: <strong>${score}/${total}</strong></p>
      <p class="quiz-badge-label">${badge.label}</p>
      <div class="quiz-actions">
        <button class="btn btn-primary" id="quiz-restart">🔄 ${t('btn.restart')}</button>
        <button class="btn btn-outline" id="quiz-share">📤 Share Result</button>
      </div>
    </div>`;
}

export function render() {
  currentQ = 0; score = 0;
  shuffledQuestions = shuffleArray(questions).slice(0, 10);
  return `
  <section class="view-quiz" aria-label="Election Quiz">
    <h1 class="view-title">${t('quiz.title')}</h1>
    <p class="view-subtitle">Test your knowledge about Indian elections!</p>
    <div class="quiz-body" id="quiz-body">${renderQuestion()}</div>
  </section>`;
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timer = setInterval(() => {
    timeLeft--;
    const el = document.getElementById('quiz-timer');
    if (el) el.textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) { clearInterval(timer); autoNext(); }
  }, 1000);
}

function autoNext() {
  if (answered) return;
  answered = true;
  const correct = shuffledQuestions[currentQ].answer;
  const options = document.querySelectorAll('.quiz-option');
  options.forEach((o, i) => {
    o.disabled = true;
    if (i === correct) o.classList.add('correct');
  });
  setTimeout(() => { currentQ++; updateQuiz(); }, 1200);
}

function updateQuiz() {
  const body = document.getElementById('quiz-body');
  if (body) { body.innerHTML = renderQuestion(); bindQuizEvents(); }
}

function bindQuizEvents() {
  const total = Math.min(shuffledQuestions.length, 10);
  if (currentQ >= total) {
    document.getElementById('quiz-restart')?.addEventListener('click', () => {
      currentQ = 0; score = 0;
      shuffledQuestions = shuffleArray(questions).slice(0, 10);
      updateQuiz();
    });
    document.getElementById('quiz-share')?.addEventListener('click', () => {
      const text = t('quiz.shareText', { score: String(score), total: String(total) });
      if (navigator.share) { navigator.share({ text }); }
      else { navigator.clipboard?.writeText(text); showToast('Result copied!', 'success'); }
    });
    return;
  }

  startTimer();

  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      clearInterval(timer);
      const idx = parseInt(btn.dataset.index);
      const correct = shuffledQuestions[currentQ].answer;
      document.querySelectorAll('.quiz-option').forEach((o, i) => {
        o.disabled = true;
        const isCorrect = i === correct;
        const isSelected = i === idx;
        o.setAttribute('aria-checked', isSelected);
        if (isCorrect) o.classList.add('correct');
        if (isSelected && !isCorrect) o.classList.add('wrong');
      });
      if (idx === correct) score++;
      setTimeout(() => { currentQ++; updateQuiz(); }, 1200);
    });
  });
}

export function mount() { bindQuizEvents(); }
export function unmount() { clearInterval(timer); }
