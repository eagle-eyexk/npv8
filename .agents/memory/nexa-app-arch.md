---
name: Nexa App Architecture
description: Key decisions and constraints for the NEXA crypto wallet platform
---

# Nexa Payment Crypto — Architecture Notes

## Auth
- JWT stored in `localStorage` as `nexa_token` (user) and `nexa_admin_token` (admin)
- `AuthContext.tsx` exposes `login`, `register`, `logout`, `user`
- Admin endpoint: `POST /api/auth/admin/login` — credentials: root / Jari!!2018
- `setAuthTokenGetter()` must be called in AuthContext so the API layer can attach headers

## API Pattern
- **No generated API client hooks** — all pages use raw `fetch()` with `localStorage.getItem("nexa_token")`
- API base: `import.meta.env.BASE_URL.replace(/\/$/, "")` + `/api/...`
- Helper pattern used in every page: `function tok() { return localStorage.getItem("nexa_token") ?? ""; }`

## Design System
- Pure CSS in `index.css` — no Tailwind; custom classes: `.glass`, `.glass-card`, `.btn`, `.stat-card`, etc.
- Background: `#EEF2FF` with radial-gradient overlays; glassmorphism via `backdrop-filter: blur(24px)`
- Colors: primary `#0EA5E9`, secondary `#8B5CF6`, accent `#10B981`
- Network background: `NetworkBackground.tsx` canvas component in `src/components/`

## Constants
- 1 NEXA = €100 = ~$108 USD
- New user bonus: 10 NEXA; merchant bonus: 5 NEXA
- Mining reward: 0.0001 NEXA per claim; min interval 25s server-side, 30s client-side

## Key files
- `artifacts/nexa-app/src/App.tsx` — router with ProtectedRoute
- `artifacts/nexa-app/src/contexts/AuthContext.tsx` — auth state
- `artifacts/nexa-app/src/components/Layout.tsx` — bottom nav + header
- `artifacts/api-server/src/routes/` — all API routes

**Why no generated client:** The OpenAPI spec was for an older scaffold; all routes were custom-written, so raw fetch is simpler and avoids type mismatch.
