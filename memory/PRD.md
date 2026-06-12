# JANLYFLIX — Product Requirements Document

## Original Problem Statement
Build a complete, responsive Netflix clone ("JANLYFLIX") that works across Smart TVs,
Android, iOS, and PC. Custom, highly attractive UI (not flat/generic) with hover-zoom
effects, warm/cozy colors (deep coffee + amber accents), a floating smart mobile nav,
a multi-layered authentication system (hardcoded admin `Loverjeans` / `2103`), a
profile selector with anime avatars and a permanent "Kids" profile with sound
effects, and a custom native video player wrapping YouTube IFrame API with episode
selection. Must be a PWA. Initially built with mock data (localStorage) and TMDB API
integration. Supabase backend planned for Phase 2.

User communication language: **Spanish**.

## Current Status (Feb 2026)
Frontend complete and polished. Backend not started yet (per user request).

## Architecture
- **Frontend**: React 19 + Tailwind + heavy custom CSS (`App.css`)
- **State**: React Context (`AuthContext`) + localStorage (`mock.js`)
- **Data**: TMDB API (real) for content; mock for auth/profiles/MyList/Likes
- **Media**: YouTube IFrame Player API wrapped in custom `VideoPlayer.jsx`
- **PWA**: `public/manifest.json` + `public/sw.js` + iOS safe-area handling
- **Backend**: Not implemented (Phase 2 — Supabase)

## Key Files
- `frontend/src/App.css` — All theming, animations, responsive rules
- `frontend/src/App.js` — Routing + global aurora background
- `frontend/src/context/AuthContext.jsx` — Mock auth + profiles
- `frontend/src/components/VideoPlayer.jsx` — Custom YouTube wrapper player
- `frontend/src/components/VideoModal.jsx` — Detail modal with tabs + episodes
- `frontend/src/pages/ProfileSelector.jsx` — Profile picker (centered, no arrows)
- `frontend/src/mock.js` — localStorage handlers + avatars + Kids chime (Web Audio API)
- `frontend/src/services/tmdb.js` — TMDB API client

## Completed Features
- Splash screen + custom auth flow (admin `Loverjeans` / `2103`)
- Profile selector (centered, max 4 profiles, KIDS permanent, anime avatars, PIN support)
- Edit-profile modal + permanent KIDS lock
- Browse page with hero, dynamic rows (Trending, Popular, Series, Top Rated, Genres)
- Card hover with scale(1.35), edge anchoring, soft radial vignette (desktop only)
- Detail modal: Episodios (TV) / Sinopsis / Reparto / Similares tabs with smooth fade
- Custom native video player: progress bar, skip ±10s, mute, volume, CC toggle,
  language picker, fullscreen, auto-hide controls
- Live search overlay (Categorías page)
- Mobile floating bottom nav (fluid responsive 320–900px)
- Like burst sparks animation + MyList toggle
- PWA install prompt + iOS Safari `vh` fix

## Recent Fixes (Feb 2026)
- Hover vignette now scoped under `@media (hover:hover) and (pointer:fine)` so it
  never appears on touch devices
- Vignette suppressed when a modal/player is open (`body:has(.modal-backdrop)`)
- `.rows-wrap` `margin-top: 0` on mobile to prevent Trending row overlapping hero
- Season switching keeps prior episodes visible (dimmed) and shows a slim
  `.season-loading-bar` instead of "Cargando episodios..." text
- Episode list fade-in via `.is-loading` class + `key={s${season}-${ep.id}}`
- Detail modal body fade transition on tab change (`.detail-body` animation)
- Video player mobile (<640px): controls scroll horizontally without breaking layout
- `VideoPlayer.jsx`: `sorted` migrated to `useMemo`, fixing exhaustive-deps warning
- `ProfileSelector.jsx`: removed dead-code arrow imports + unused `railRef` + `scroll()`

## Roadmap

### P0 — Phase 2: Supabase Backend
- Real auth (replace mock `Loverjeans/2103`)
- Profiles table (with hashed PINs)
- `my_list` + `likes` sync (per-profile)
- Real-time updates

### P1 — Polish
- Continue Watching row (track playback position per profile)
- Genre-filtered Categorías sub-pages
- Refactor `App.css` (1500+ lines) into theme modules
- Split `VideoPlayer.jsx` (~230 lines) into Controls / Captions / LangMenu sub-components

### P2 — Future
- Real subtitle file uploads (.vtt)
- Download for offline (PWA cache)
- Recommendations engine
- TV remote / D-Pad keyboard navigation (Smart TV)

## Test Credentials
See `/app/memory/test_credentials.md`.

## Last Update
2026-02 — UI polish round complete; testing agent passed 11/11 validations.
