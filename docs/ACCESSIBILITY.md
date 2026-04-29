# Accessibility Implementation (WCAG 2.1 AA)

## Checklist

- [x] **Skip navigation link** — "Skip to main content" for keyboard users
- [x] **Semantic HTML** — `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`
- [x] **ARIA labels** — All buttons and interactive elements have `aria-label`
- [x] **ARIA roles** — `role="navigation"`, `role="dialog"`, `role="log"`, `role="list"`
- [x] **ARIA live regions** — `aria-live="polite"` on chat messages and dynamic content
- [x] **Keyboard navigation** — All interactive elements accessible via Tab, Enter, Space, Escape
- [x] **Focus visible** — Custom `:focus-visible` styles with blue outline
- [x] **Focus management** — Modal focus trapped, returned on close
- [x] **Color contrast** — Text meets 4.5:1 ratio (light text on dark backgrounds)
- [x] **Reduced motion** — `prefers-reduced-motion` media query disables animations
- [x] **Multi-language** — English + Hindi with `data-i18n` attribute system
- [x] **Form labels** — All inputs have associated `<label>` elements
- [x] **Alt text** — SVG icons marked `aria-hidden="true"`
- [x] **Heading hierarchy** — Single `<h1>` per view, proper nesting
- [x] **Touch targets** — Buttons minimum 44x44px on mobile
- [x] **Responsive** — Mobile-first design, works on all screen sizes
