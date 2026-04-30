# 🗳️ Election Assistant India

> **AI-powered Interactive Voting Guide for Indian Citizens**
> Built for **Hack2Skill PromptWars** — Empowering 950M+ eligible voters with accessible, multilingual election guidance.

[![Tests](https://img.shields.io/badge/tests-149%20passed-brightgreen)](#testing)
[![Coverage](https://img.shields.io/badge/coverage-80%25%2B-brightgreen)](#testing)
[![WCAG](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-blue)](#accessibility)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

---

## 📋 Problem Statement

India has **950 million+ eligible voters** across 543 constituencies, yet many citizens — especially first-time voters — lack clear, accessible information about the election process. Language barriers, complex registration procedures, and difficulty locating polling booths create significant obstacles to democratic participation.

**Election Assistant** solves this by providing an interactive, AI-powered web application that guides citizens through every step of the voting process — from eligibility verification to casting their vote — in both English and Hindi.

---

## ✨ Features

| Feature | Description | Google Service |
|---------|-------------|----------------|
| 📋 **Step-by-Step Guide** | 5-step interactive wizard covering eligibility, registration, documents, booth location, and voting day | — |
| 🤖 **AI Chatbot** | Natural language chatbot with keyword matching, speech recognition, and text-to-speech | Web Speech API |
| 📅 **Election Timeline** | Visual timeline of the complete election process from announcement to government formation | — |
| 📍 **Polling Booth Finder** | Interactive map with booth search, geolocation, and marker clustering | **Google Maps Platform** |
| 🏆 **Knowledge Quiz** | Gamified 12-question quiz with timer, scoring, badges, and social sharing | — |
| 🌐 **Multi-Language** | Full English ↔ Hindi translation with dynamic UI updates | **Google Cloud Translation API** |
| 🔐 **User Profiles** | Persistent profiles with age, state, and voter status stored securely in localStorage | — |
| 🔥 **Cloud Backend** | Anonymous authentication and serverless data persistence | **Google Firebase** (Auth + Firestore) |

---

## 🏗️ Architecture

```
election-assistant/
├── index.html              # Single-page app shell with CSP headers
├── style.css               # Complete design system (dark/light themes)
├── manifest.json           # PWA manifest
├── js/
│   ├── app.js              # Main controller & initialization
│   ├── router.js           # Hash-based SPA router
│   ├── state.js            # Centralized pub/sub state store
│   ├── security.js         # Input sanitization & XSS prevention
│   ├── i18n.js             # Internationalization (EN/HI)
│   ├── components.js       # Reusable UI components (Modal, Toast, Stepper)
│   ├── views/
│   │   ├── home.js         # Landing page with feature cards & FAQ
│   │   ├── wizard.js       # 5-step voting guide
│   │   ├── chatbot.js      # AI chatbot with speech recognition
│   │   ├── timeline.js     # Election process visualizer
│   │   ├── polling.js      # Map-based booth locator
│   │   └── quiz.js         # Gamified knowledge quiz
│   └── services/
│       ├── firebase.js     # Firebase Auth & Firestore integration
│       ├── maps.js         # Google Maps API integration
│       └── translate.js    # Google Translate API proxy
├── server/
│   ├── server.js           # Express server with security middleware
│   └── data/               # Quiz questions & polling booth data
├── tests/                  # 9 test suites, 149 tests
│   ├── server.test.js      # API endpoint & middleware tests
│   ├── security.test.js    # XSS prevention & input validation
│   ├── chatbot.test.js     # Keyword matching & response logic
│   ├── quiz.test.js        # Question integrity & scoring
│   ├── state.test.js       # State management & persistence
│   ├── i18n.test.js        # Translation & language switching
│   ├── components.test.js  # UI component rendering & ARIA
│   ├── accessibility.test.js # WCAG compliance validation
│   └── data.test.js        # Data integrity & geographic bounds
└── docs/
    ├── SECURITY.md         # Security implementation details
    └── ACCESSIBILITY.md    # WCAG 2.1 AA compliance checklist
```

---

## 🔧 Google Cloud Services Integration

This project leverages **three Google Cloud services** to deliver production-quality features:

### 1. 📍 Google Maps Platform
- **Maps JavaScript API** for interactive polling booth visualization
- **Geocoding API** for address-to-coordinate conversion
- **Geolocation** for "Find Near Me" booth discovery
- **Marker clustering** for dense urban areas

### 2. 🌐 Google Cloud Translation API
- Dynamic translation of chatbot responses beyond static i18n strings
- Server-side proxy to protect API keys
- Supports 100+ languages for future expansion

### 3. 🔥 Google Firebase
- **Firebase Authentication** (Anonymous Auth) — lets users save progress without creating accounts
- **Cloud Firestore** — serverless quiz leaderboard and user data persistence
- **Firebase Hosting** — free SSL, CDN, and custom domain support

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/election-assistant.git
cd election-assistant

# Install dependencies
npm install

# Configure environment variables
cp server/.env.example server/.env
# Edit .env with your API keys
```

### Development
```bash
# Start development server with hot reload
npm run dev

# Open in browser
# http://localhost:3000
```

### Production
```bash
# Start production server
npm start
```

---

## 🧪 Testing

The project includes **9 comprehensive test suites** with **149 tests** covering:

| Suite | Tests | Coverage |
|-------|-------|----------|
| Server API | 21 | All endpoints, middleware, error handling |
| Security | 14 | XSS prevention, input sanitization, validation |
| Chatbot | 17 | Keyword matching, response categorization, wizard flow |
| Quiz | 9 | Question integrity, scoring logic, badge assignment |
| State | 13 | State management, persistence, pub/sub |
| i18n | 14 | Translation, fallback, language switching |
| Components | 18 | Modal, Stepper, Card rendering & ARIA |
| Accessibility | 29 | Semantic HTML, ARIA, CSP, SEO |
| Data Integrity | 11 | Geographic bounds, data completeness |

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

---

## ♿ Accessibility

Fully compliant with **WCAG 2.1 Level AA**:

- ✅ Skip navigation link for keyboard users
- ✅ Semantic HTML5 landmarks (`<nav>`, `<main>`, `<footer>`, `<section>`)
- ✅ ARIA roles, labels, and live regions for dynamic content
- ✅ Keyboard navigation — Tab, Enter, Space, Escape
- ✅ Custom `:focus-visible` styles for keyboard users
- ✅ Color contrast ≥ 4.5:1 ratio (both themes)
- ✅ `prefers-reduced-motion` — disables animations for users who request it
- ✅ Form labels, input types, and autocomplete attributes
- ✅ Touch targets ≥ 44×44px on mobile
- ✅ Responsive mobile-first design

---

## 🔒 Security

- **Input Sanitization** — All user input escaped via `escapeHTML()` before rendering
- **Content Security Policy** — Strict CSP headers via both `<meta>` and Helmet
- **Rate Limiting** — 100 requests / 15 minutes per IP
- **Helmet.js** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-XSS-Protection`
- **Request Size Limits** — 10KB maximum body size
- **No Console Logging** — Zero `console.*` calls in production code
- **Environment Variables** — All secrets in `.env` (never committed)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JavaScript (ES Modules), HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Maps | Leaflet.js + Google Maps Platform |
| Auth & DB | Google Firebase (Auth + Firestore) |
| Translation | Google Cloud Translation API |
| Testing | Jest, Supertest |
| Security | Helmet, express-rate-limit, CORS, CSP |
| CI/CD | Google Cloud Run |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- **Election Commission of India (ECI)** — Official voting guidelines and data
- **Google Cloud Platform** — Maps, Translation, Firebase, and Cloud Run
- **Hack2Skill** — PromptWars competition platform

---

*Built with ❤️ for Indian democracy. Every vote counts. 🇮🇳*
