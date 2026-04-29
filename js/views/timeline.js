/**
 * Timeline View — Interactive election process timeline visualizer
 */
import { t } from '../i18n.js';

const phases = [
  { icon: '📢', title: 'Election Announcement', desc: 'The Election Commission announces election dates, the Model Code of Conduct comes into effect, and the schedule is published.', phase: 'Pre-Election' },
  { icon: '📝', title: 'Nominations Filed', desc: 'Candidates file nomination papers with returning officers. Security deposits are submitted along with required documents.', phase: 'Pre-Election' },
  { icon: '🔍', title: 'Scrutiny of Nominations', desc: 'Returning officers verify all nomination papers. Invalid or incomplete nominations are rejected.', phase: 'Pre-Election' },
  { icon: '🚫', title: 'Withdrawal of Candidatures', desc: 'Last date for candidates to withdraw from the contest. Final list of candidates is published after this.', phase: 'Pre-Election' },
  { icon: '📣', title: 'Election Campaign', desc: 'Political parties campaign through rallies, advertisements, and door-to-door visits. Campaigning must stop 48 hours before polling.', phase: 'Pre-Election' },
  { icon: '🗳️', title: 'Polling Day', desc: 'Voters cast their votes at assigned polling stations using EVMs. Polling hours: 7 AM to 6 PM. Indelible ink is applied.', phase: 'Election Day' },
  { icon: '📦', title: 'EVMs Sealed & Secured', desc: 'After polling ends, EVMs are sealed in the presence of candidates\' agents and transported to secure strong rooms.', phase: 'Post-Election' },
  { icon: '📊', title: 'Vote Counting', desc: 'Votes are counted under strict supervision. Postal ballots counted first, then EVM results. VVPAT slips verified for select booths.', phase: 'Post-Election' },
  { icon: '🏆', title: 'Results Declared', desc: 'Winners are announced constituency-wise. The party/alliance with majority (272+ seats in Lok Sabha) is invited to form the government.', phase: 'Post-Election' },
  { icon: '🏛️', title: 'Government Formation', desc: 'The winning party\'s leader is sworn in as Prime Minister. Council of Ministers is formed and governance begins.', phase: 'Post-Election' }
];

export function render() {
  return `
  <section class="view-timeline" aria-label="Election Timeline">
    <h1 class="view-title">${t('timeline.title')}</h1>
    <p class="view-subtitle">Follow the journey of an Indian election from announcement to government formation.</p>
    <div class="timeline" role="list">
      ${phases.map((p, i) => `
        <div class="timeline-item ${i <= 4 ? 'pre' : i === 5 ? 'day' : 'post'}" 
             role="listitem" tabindex="0" id="timeline-item-${i}">
          <div class="timeline-marker">
            <div class="timeline-icon">${p.icon}</div>
            <div class="timeline-line"></div>
          </div>
          <div class="timeline-card">
            <span class="timeline-phase-badge">${p.phase}</span>
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </section>`;
}

export function mount() {
  // Animate items on scroll into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));
}

export function unmount() { }
