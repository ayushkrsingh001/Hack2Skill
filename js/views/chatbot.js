/**
 * Chatbot View — AI-powered election assistant chat interface
 * Rule-based response engine with personalized answers.
 */
import { t } from '../i18n.js';
import { getState, setState } from '../state.js';
import { escapeHTML, sanitizeInput } from '../security.js';

/** Knowledge base — keyword-to-response mapping */
const knowledgeBase = {
  en: [
    {
      keys: ['how can i vote', 'how do i vote', 'how to vote', 'voting process', 'cast my vote'],
      response: () => `<h3>How to Vote in India 🗳️</h3>
        <ol class="step-list"><li>Check eligibility — 18+ Indian citizen</li>
        <li>Register at <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a> (Form 6)</li>
        <li>Receive your Voter ID Card (EPIC)</li>
        <li>Find your assigned polling booth</li>
        <li>Visit the booth on election day with valid ID</li>
        <li>Get your finger inked and cast your vote on the EVM</li></ol>
        <div class="info-box info-tip">💡 Check your voter list status on the <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">NVSP portal</a>.</div>`},
    {
      keys: ['register', 'registration', 'enroll', 'form 6', 'nvsp', 'apply for voter'],
      response: () => `<h3>Voter Registration Guide 📝</h3>
        <p><strong>Online:</strong></p><ol class="step-list">
        <li>Go to <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a></li>
        <li>Select "New Voter Registration"</li>
        <li>Fill Form 6 with your details</li>
        <li>Upload documents (photo, age proof, address proof)</li>
        <li>Submit and save reference number</li></ol>
        <p><strong>Offline:</strong> Visit your nearest Electoral Registration Office with Form 6 and documents.</p>
        <div class="info-box info-warning">⏱️ Processing takes 2–4 weeks.</div>`},
    {
      keys: ['document', 'papers', 'id proof', 'what do i need', 'proof'],
      response: () => `<h3>Documents Required 📄</h3>
        <p><strong>For Registration:</strong></p><ul>
        <li>📷 Passport-size photo</li><li>🎂 Age proof (Birth cert / Class 10 / Aadhaar)</li>
        <li>🏠 Address proof (Aadhaar / Utility bill / Bank passbook)</li></ul>
        <p><strong>At Polling Booth (any one):</strong></p>
        <ul><li>🪪 Voter ID (EPIC)</li><li>Aadhaar / Passport / DL / PAN</li></ul>`},
    {
      keys: ['eligible', 'eligibility', 'who can vote', 'can i vote', 'qualify'],
      response: () => {
        const u = getState().user; let r = `<h3>Voter Eligibility ✅</h3>
        <ul><li>🎂 Age: 18+ on qualifying date (Jan 1)</li>
        <li>🇮🇳 Indian citizen</li><li>🏠 Resident of the constituency</li>
        <li>🚫 Not disqualified under any law</li></ul>`;
        if (u?.age) r += u.age < 18 ? `<div class="info-box info-warning">⚠️ At ${u.age}, you're not eligible yet.</div>`
          : `<div class="info-box info-success">✅ At ${u.age}, you meet the age requirement!</div>`;
        return r;
      }
    },
    {
      keys: ['voting day', 'election day', 'polling day', 'booth', 'what happens'],
      response: () => `<h3>Voting Day Guide 🏛️</h3>
        <ol class="step-list"><li>Find your booth (check voters.eci.gov.in)</li>
        <li>Arrive — Polling hours: 7 AM to 6 PM</li>
        <li>Stand in queue (separate for men/women/seniors)</li>
        <li>Show your Voter ID or approved ID</li>
        <li>Get inked on left index finger</li>
        <li>Press the button on the EVM next to your candidate</li>
        <li>Verify on VVPAT slip (shown for 7 seconds)</li>
        <li>Exit quietly</li></ol>
        <div class="info-box info-tip">🔒 Voting is secret. Never share photos of your vote.</div>`},
    {
      keys: ['timeline', 'stages', 'phases', 'schedule', 'election process'],
      response: () => `<h3>Election Timeline 📅</h3>
        <p><strong>Before:</strong> Announcement → Nominations → Scrutiny → Withdrawal → Campaigning (ends 48h before polling)</p>
        <p><strong>On Election Day:</strong> Booths open 7AM–6PM → Voters cast votes → EVMs sealed</p>
        <p><strong>After:</strong> Counting day → Results declared → Government formation</p>
        <div class="info-box info-tip">💡 General elections happen in multiple phases across states.</div>
        <p><a href="#/timeline">View the interactive timeline →</a></p>`},
    {
      keys: ['evm', 'electronic voting', 'voting machine', 'vvpat'],
      response: () => `<h3>EVM & VVPAT 🖥️</h3>
        <ul><li>🖥️ EVM — Simple machine with buttons next to candidate names</li>
        <li>📄 VVPAT — Prints a slip for 7-second verification</li>
        <li>🔋 Battery-powered (no electricity needed)</li>
        <li>🔒 Tamper-proof, no network connection</li>
        <li>Each EVM records up to 2,000 votes</li></ul>`},
    {
      keys: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'],
      response: () => {
        const n = getState().user?.name; return `<h3>Namaste${n ? ' ' + n : ''}! 🙏</h3>
        <p>I can help you with:</p><ul>
        <li>🗳️ How to vote</li><li>📝 Registration</li><li>📄 Documents</li>
        <li>✅ Eligibility</li><li>🏛️ Voting day</li><li>📅 Timeline</li></ul>`;
      }
    },
    {
      keys: ['thank', 'thanks', 'helpful', 'great', 'awesome'],
      response: () => `<h3>You're welcome! 😊</h3><p>Every vote counts! 🇮🇳</p>`
    }
  ],
  hi: [
    {
      keys: ['वोट कैसे दें', 'मतदान कैसे करें', 'प्रक्रिया', 'वोटिंग', 'अपना वोट'],
      response: () => `<h3>भारत में वोट कैसे दें 🗳️</h3>
        <ol class="step-list"><li>पात्रता की जाँच करें — 18+ भारतीय नागरिक</li>
        <li><a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a> पर पंजीकरण करें (फॉर्म 6)</li>
        <li>अपना वोटर आईडी कार्ड (EPIC) प्राप्त करें</li>
        <li>अपना मतदान केंद्र खोजें</li>
        <li>चुनाव के दिन वैध आईडी के साथ बूथ पर जाएं</li>
        <li>उंगली पर स्याही लगवाएं और EVM पर अपना वोट डालें</li></ol>
        <div class="info-box info-tip">💡 <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">NVSP पोर्टल</a> पर अपनी मतदाता सूची की स्थिति जांचें।</div>`},
    {
      keys: ['पंजीकरण', 'रजिस्टर', 'फॉर्म 6', 'nvsp', 'अप्लाई'],
      response: () => `<h3>मतदाता पंजीकरण गाइड 📝</h3>
        <p><strong>ऑनलाइन:</strong></p><ol class="step-list">
        <li><a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a> पर जाएं</li>
        <li>"नया मतदाता पंजीकरण" चुनें</li>
        <li>अपने विवरण के साथ फॉर्म 6 भरें</li>
        <li>दस्तावेज़ अपलोड करें (फोटो, आयु प्रमाण, पता प्रमाण)</li>
        <li>सबमिट करें और संदर्भ संख्या सहेजें</li></ol>
        <p><strong>ऑफ़लाइन:</strong> फॉर्म 6 और दस्तावेज़ों के साथ अपने निकटतम निर्वाचन पंजीकरण कार्यालय जाएं।</p>
        <div class="info-box info-warning">⏱️ प्रक्रिया में 2–4 सप्ताह लगते हैं।</div>`},
    {
      keys: ['दस्तावेज़', 'कागज', 'आईडी', 'क्या चाहिए', 'प्रमाण'],
      response: () => `<h3>आवश्यक दस्तावेज़ 📄</h3>
        <p><strong>पंजीकरण के लिए:</strong></p><ul>
        <li>📷 पासपोर्ट आकार का फोटो</li><li>🎂 आयु प्रमाण (जन्म प्रमाण पत्र / कक्षा 10 / आधार)</li>
        <li>🏠 पता प्रमाण (आधार / बिजली बिल / बैंक पासबुक)</li></ul>
        <p><strong>मतदान केंद्र पर (कोई एक):</strong></p>
        <ul><li>🪪 वोटर आईडी (EPIC)</li><li>आधार / पासपोर्ट / ड्राइविंग लाइसेंस / पैन</li></ul>`},
    {
      keys: ['पात्र', 'पात्रता', 'कौन वोट दे सकता है', 'क्या मैं', 'उम्र'],
      response: () => {
        const u = getState().user; let r = `<h3>मतदाता पात्रता ✅</h3>
        <ul><li>🎂 आयु: अर्हता तिथि (1 जनवरी) को 18+</li>
        <li>🇮🇳 भारतीय नागरिक</li><li>🏠 निर्वाचन क्षेत्र का निवासी</li>
        <li>🚫 किसी भी कानून के तहत अयोग्य घोषित न हो</li></ul>`;
        if (u?.age) r += u.age < 18 ? `<div class="info-box info-warning">⚠️ ${u.age} वर्ष की आयु में, आप अभी पात्र नहीं हैं।</div>`
          : `<div class="info-box info-success">✅ ${u.age} वर्ष की आयु में, आप आयु की आवश्यकता को पूरा करते हैं!</div>`;
        return r;
      }
    },
    {
      keys: ['मतदान के दिन', 'चुनाव के दिन', 'बूथ', 'क्या होता है'],
      response: () => `<h3>मतदान दिवस गाइड 🏛️</h3>
        <ol class="step-list"><li>अपना बूथ खोजें (voters.eci.gov.in देखें)</li>
        <li>पहुंचें — मतदान का समय: सुबह 7 बजे से शाम 6 बजे तक</li>
        <li>कतार में खड़े हों (पुरुषों/महिलाओं/वरिष्ठ नागरिकों के लिए अलग)</li>
        <li>अपना वोटर आईडी या स्वीकृत आईडी दिखाएं</li>
        <li>बाएं तर्जनी पर स्याही लगवाएं</li>
        <li>EVM पर अपने उम्मीदवार के बगल वाला बटन दबाएं</li>
        <li>VVPAT पर्ची पर सत्यापित करें (7 सेकंड के लिए दिखाया गया)</li>
        <li>चुपचाप बाहर निकलें</li></ol>
        <div class="info-box info-tip">🔒 मतदान गुप्त है। कभी भी अपने वोट की तस्वीरें साझा न करें।</div>`},
    {
      keys: ['समयरेखा', 'चरण', 'अनुसूची', 'प्रक्रिया'],
      response: () => `<h3>चुनाव समयरेखा 📅</h3>
        <p><strong>पहले:</strong> घोषणा → नामांकन → छंटनी → वापसी → प्रचार (मतदान से 48 घंटे पहले समाप्त)</p>
        <p><strong>चुनाव के दिन:</strong> बूथ सुबह 7 बजे-शाम 6 बजे खुलते हैं → मतदाता वोट डालते हैं → EVM सील</p>
        <p><strong>बाद में:</strong> मतगणना का दिन → परिणाम घोषित → सरकार गठन</p>
        <div class="info-box info-tip">💡 आम चुनाव राज्यों में कई चरणों में होते हैं।</div>
        <p><a href="#/timeline">इंटरैक्टिव समयरेखा देखें →</a></p>`},
    {
      keys: ['evm', 'ईवीएम', 'मशीन', 'vvpat', 'वीवीपैट'],
      response: () => `<h3>EVM और VVPAT 🖥️</h3>
        <ul><li>🖥️ EVM — उम्मीदवार के नाम के बगल में बटन वाली सरल मशीन</li>
        <li>📄 VVPAT — 7-सेकंड के सत्यापन के लिए एक पर्ची प्रिंट करता है</li>
        <li>🔋 बैटरी से चलने वाला (बिजली की आवश्यकता नहीं)</li>
        <li>🔒 छेड़छाड़-प्रूफ, कोई नेटवर्क कनेक्शन नहीं</li>
        <li>प्रत्येक EVM 2,000 वोट तक रिकॉर्ड करता है</li></ul>`},
    {
      keys: ['नमस्ते', 'हेलो', 'हाय', 'सुप्रभात', 'शुभ संध्या'],
      response: () => {
        const n = getState().user?.name; return `<h3>नमस्ते${n ? ' ' + n : ''}! 🙏</h3>
        <p>मैं आपकी मदद कर सकता हूँ:</p><ul>
        <li>🗳️ वोट कैसे दें</li><li>📝 पंजीकरण</li><li>📄 दस्तावेज़</li>
        <li>✅ पात्रता</li><li>🏛️ मतदान का दिन</li><li>📅 समयरेखा</li></ul>`;
      }
    },
    {
      keys: ['धन्यवाद', 'शुक्रिया', 'मददगार', 'बढ़िया'],
      response: () => `<h3>आपका स्वागत है! 😊</h3><p>हर वोट मायने रखता है! 🇮🇳</p>`
    }
  ]
};

function generateResponse(input) {
  const lang = getState().language || 'en';
  const q = input.toLowerCase();
  const base = knowledgeBase[lang] || knowledgeBase['en'];

  for (const entry of base) {
    if (entry.keys.some(k => q.includes(k))) return entry.response();
  }

  if (lang === 'hi') {
    return `<p>मैं आपकी मदद कर सकता हूँ:</p><ul>
      <li>🗳️ <strong>वोट कैसे दें</strong></li><li>✅ <strong>पात्रता</strong></li>
      <li>📝 <strong>पंजीकरण</strong></li><li>📄 <strong>दस्तावेज़</strong></li>
      <li>🏛️ <strong>मतदान का दिन</strong></li><li>📅 <strong>समयरेखा</strong></li></ul>
      <div class="info-box info-tip">💡 कोशिश करें "मैं मतदान के लिए पंजीकरण कैसे करूं?" या "मुझे किन दस्तावेजों की आवश्यकता है?"</div>`;
  }

  return `<p>I can help you with:</p><ul>
    <li>🗳️ <strong>How to vote</strong></li><li>✅ <strong>Eligibility</strong></li>
    <li>📝 <strong>Registration</strong></li><li>📄 <strong>Documents</strong></li>
    <li>🏛️ <strong>Voting day</strong></li><li>📅 <strong>Timeline</strong></li></ul>
    <div class="info-box info-tip">💡 Try "How do I register to vote?" or "What documents do I need?"</div>`;
}

function timeNow() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

export function render() {
  return `
  <section class="view-chat" aria-label="Election Chatbot">
    <div class="chat-container">
      <div class="chat-header-bar">
        <div class="chat-avatar-indicator"><div class="avatar-dot"></div>🤖</div>
        <div><strong>VoteSathi AI</strong><br><small class="text-muted">Powered by Gemini — Ready to help</small></div>
      </div>
      <div class="chat-messages" id="chatMessages" role="log" aria-live="polite" aria-label="Chat messages"></div>
      <div class="chat-chips" id="chatChips">
        <button class="chip" data-query-en="How can I vote?" data-query-hi="मैं वोट कैसे दे सकता हूँ?">🗳️ <span data-i18n="chat.chip.vote">${t('chat.chip.vote')}</span></button>
        <button class="chip" data-query-en="What documents do I need?" data-query-hi="मुझे किन दस्तावेजों की आवश्यकता है?">📄 <span data-i18n="chat.chip.docs">${t('chat.chip.docs')}</span></button>
        <button class="chip" data-query-en="Am I eligible to vote?" data-query-hi="क्या मैं वोट देने के योग्य हूँ?">✅ <span data-i18n="chat.chip.elig">${t('chat.chip.elig')}</span></button>
        <button class="chip" data-query-en="What happens on voting day?" data-query-hi="मतदान के दिन क्या होता है?">🏛️ <span data-i18n="chat.chip.day">${t('chat.chip.day')}</span></button>
        <button class="chip" data-query-en="Election timeline" data-query-hi="चुनाव समयरेखा">📅 <span data-i18n="chat.chip.time">${t('chat.chip.time')}</span></button>
      </div>
      <div class="chat-input-area">
        <div class="chat-input-wrap">
          <textarea id="chatInput" rows="1" placeholder="${t('chat.placeholder')}" 
                    data-i18n-placeholder="chat.placeholder" aria-label="Type your message"></textarea>
          <button class="voice-btn" id="chatStopTtsBtn" aria-label="Stop speaking" title="Stop Speaking" style="display:none; background:var(--bg3); color:#ef4444;">🔇</button>
          <button class="voice-btn" id="chatVoiceBtn" aria-label="Start voice input" title="Voice Input">🎤</button>
          <button class="send-btn" id="chatSendBtn" aria-label="Send message" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p class="chat-disclaimer">${t('chat.disclaimer')} <a href="https://www.eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a></p>
      </div>
    </div>
  </section>`;
}

function addMessage(container, role, content) {
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;
  div.setAttribute('role', 'article');
  const avatar = role === 'bot' ? '🤖' : '👤';
  if (role === 'user') {
    div.innerHTML = `<div class="msg-body"><div class="msg-content">${escapeHTML(content)}</div>
      <div class="msg-time">${timeNow()}</div></div><div class="msg-avatar">${avatar}</div>`;
  } else {
    div.innerHTML = `<div class="msg-avatar">${avatar}</div>
      <div class="msg-body"><div class="msg-content">${content}</div>
      <div class="msg-time">${timeNow()}</div></div>`;
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping(container) {
  const div = document.createElement('div');
  div.className = 'msg msg-bot'; div.id = 'typing-indicator';
  div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-body"><div class="msg-content">
    <div class="typing-dots"><span></span><span></span><span></span></div></div></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

export function mount() {
  const container = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const voiceBtn = document.getElementById('chatVoiceBtn');
  const stopTtsBtn = document.getElementById('chatStopTtsBtn');
  if (!container || !input) return;

  // Stop TTS button listener
  if (stopTtsBtn) {
    stopTtsBtn.addEventListener('click', () => {
      window.speechSynthesis?.cancel();
      stopTtsBtn.style.display = 'none';
    });
  }

  // Pre-load voices so they are ready
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }

  // TTS helper
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const temp = document.createElement('div');
    temp.innerHTML = text;
    const cleanText = temp.textContent || temp.innerText || '';
    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Try to find a female voice
    const voices = window.speechSynthesis.getVoices();
    const lang = getState().language || 'en';

    let selectedVoice = null;

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      const preferredHiVoices = ['Aditi', 'Lekha', 'Pallavi', 'Female', 'hi-IN'];
      for (const name of preferredHiVoices) {
        selectedVoice = voices.find(v => v.lang.includes('hi-IN') && v.name.toLowerCase().includes(name.toLowerCase()));
        if (selectedVoice) break;
      }
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('hi-IN'));
    } else {
      utterance.lang = 'en-IN';
      const preferredEnVoices = ['Neerja', 'Zira', 'Hazel', 'Samantha', 'Victoria', 'Karen', 'Female'];
      for (const name of preferredEnVoices) {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (selectedVoice) break;
      }
      // Fallback: grab any Indian voice that isn't explicitly male
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('en-IN') && !v.name.includes('Heera') && !v.name.includes('Ravi'));
      }
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => { if (stopTtsBtn) stopTtsBtn.style.display = 'flex'; };
    utterance.onend = () => { if (stopTtsBtn) stopTtsBtn.style.display = 'none'; };
    utterance.onerror = () => { if (stopTtsBtn) stopTtsBtn.style.display = 'none'; };

    window.speechSynthesis.speak(utterance);
  }

  // Welcome message
  const lang = getState().language || 'en';
  const welcomeText = lang === 'hi' ?
    `<h3>नमस्ते! 🙏</h3><p>मैं <strong>VoteSathi</strong> हूँ — आपका AI चुनाव सहायक। Gemini AI द्वारा संचालित।</p><p>भारत में चुनाव के बारे में कुछ भी पूछें!</p>` :
    `<h3>Namaste! 🙏</h3><p>I'm <strong>VoteSathi</strong> — your AI Election Assistant powered by Gemini.</p><p>Ask me anything about elections in India, or try the quick topics below.</p>`;

  addMessage(container, 'bot', welcomeText);

  const handleSend = async () => {
    const text = sanitizeInput(input.value);
    if (!text) return;
    addMessage(container, 'user', text);
    input.value = ''; input.style.height = 'auto'; sendBtn.disabled = true;
    showTyping(container);

    try {
      const user = getState().user || {};
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userContext: {
            name: user.name || '',
            age: user.age || null,
            state: user.state || '',
            firstTimeVoter: user.firstTime === 'yes',
            language: getState().language || 'en'
          }
        })
      });

      document.getElementById('typing-indicator')?.remove();

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || generateResponse(text);
        // Convert markdown bold to HTML for Gemini responses
        const formatted = data.source === 'gemini'
          ? reply.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
          : reply;
        addMessage(container, 'bot', formatted);
        speak(formatted);
      } else {
        const fallback = generateResponse(text);
        addMessage(container, 'bot', fallback);
        speak(fallback);
      }
    } catch (_e) {
      document.getElementById('typing-indicator')?.remove();
      const fallback = generateResponse(text);
      addMessage(container, 'bot', fallback);
      speak(fallback);
    }
  };

  // Setup Voice Recognition
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = getState().language === 'hi' ? 'hi-IN' : 'en-IN';

    let isRecording = false;

    recognition.onstart = () => {
      isRecording = true;
      voiceBtn.classList.add('recording');
      input.placeholder = 'Listening...';
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      input.value = transcript;
      sendBtn.disabled = !transcript.trim();
    };

    recognition.onerror = (event) => {
      /* Speech recognition error — handled silently */
      isRecording = false;
      voiceBtn.classList.remove('recording');
      input.placeholder = 'Type your message...';
    };

    recognition.onend = () => {
      isRecording = false;
      voiceBtn.classList.remove('recording');
      input.placeholder = 'Type your message...';
      if (input.value.trim() && !sendBtn.disabled) {
        handleSend();
      }
    };

    voiceBtn.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
      } else {
        input.value = '';
        recognition.start();
      }
    });
  } else {
    if (voiceBtn) voiceBtn.style.display = 'none';
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim();
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  document.querySelectorAll('#chatChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const lang = getState().language || 'en';
      input.value = lang === 'hi' ? chip.dataset.queryHi : chip.dataset.queryEn;
      handleSend();
    });
  });
}

export function unmount() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
