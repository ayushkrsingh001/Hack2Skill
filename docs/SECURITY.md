# Security Implementation

## Practices Applied

### 1. Input Sanitization
- All user inputs sanitized via `escapeHTML()` before rendering
- Server-side sanitization middleware on all POST body fields
- Max input length enforced (500 chars)

### 2. XSS Prevention
- User text rendered via `textContent` (not `innerHTML`)
- HTML entities escaped: `< > " ' &`
- Content Security Policy headers via `<meta>` tag and Helmet

### 3. API Security
- Rate limiting: 100 requests / 15 minutes per IP
- Request body size limit: 10KB
- CORS configured with allowed origins
- Helmet.js for security headers

### 4. Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Full CSP directives

### 5. API Keys
- Google Maps API key configured via HTML (restricted by HTTP referrer in Google Cloud Console)
- Firebase config is client-safe by design (security enforced via Firestore rules)
- Server secrets stored in `.env` (never committed)

### 6. Data Storage
- User profile stored in `localStorage` (no PII sent to server)
- No cookies used (no CSRF risk)
- No authentication tokens stored in client
