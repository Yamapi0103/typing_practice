# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 + TypeScript single-page app for practicing Chinese (Bopomofo/注音) and English typing. Features real-time WPM/accuracy tracking, an interactive keyboard display, and Supabase cloud sync for authenticated users.

## Commands

```bash
pnpm dev          # Start dev server with vite proxy rules
pnpm build        # Type-check (vue-tsc) + build for production
pnpm preview      # Preview built output locally
```

All other tasks (dependency installation, server startup) are handled separately.

## Architecture

### Routing (`src/router/index.ts`)
- Three routes: `/` (HomeView), `/practice` (PracticeView), `/stats` (StatsView)
- All routes are public (no auth guards), but Supabase integration adds benefits for logged-in users

### State Management
**Pinia store** (`src/stores/historyStore.ts`):
- Persisted to localStorage via `pinia-plugin-persistedstate` when the user is not logged in
- Tracks practice sessions and per-character error counts
- Computed weak characters (top 20 by error rate)
- Acts as the fallback data source when the user is not authenticated

**Supabase** (`src/lib/supabase.ts`, `src/composables/useAuth.ts`):
- Google OAuth via `useAuth()` (module-level singleton that keeps the `user` ref in sync)
- Dual persistence: PracticeView writes to both the local store and the `typing_records` table when authenticated
- StatsView reads from Supabase when logged in; otherwise falls back to the local store

### Data Sources

| Language | Source | Dev Proxy | Production |
|----------|--------|-----------|------------|
| Chinese (Bopomofo) | Static fallback + Ministry of Education Taiwan RSS | `/rss` | `api/rss.ts` (Vercel Edge Function) |
| English | type.fit/data/typing-texts.json | `/typefit` | `api/data.ts` (Vercel Edge Function) |

Managed by the `useSentences.ts` composable (module singleton) which maintains shuffled sentence queues per language and level.

## Key Design Patterns

### 1. Language-Specific Input Handling
**Chinese** (`ChineseInput.vue`):
- Standard `<input>` with IME awareness
- Listens to `compositionstart`/`compositionend` to avoid scoring incomplete characters
- Emits `update:composing` and `update:composingStartLen` so the parent knows when composition is in progress

**English** (`EnglishInput.vue`):
- Invisible input that intercepts `beforeinput` events
- Validates each character against the target text; no backspace allowed
- Detects IME composition and warns the user

### 2. Module-Level Composable Singletons
`useAuth()` and `useSentences()` initialize their reactive state at module load time (outside the exported function), so all components share the same reference. This provides a lightweight alternative to Pinia for features that don't need persistence.

### 3. Dual Persistence Strategy
- **Local-first**: PracticeView saves to the Pinia store immediately (works offline)
- **Cloud-synced**: When authenticated, also writes to the Supabase `typing_records` table
- **Transparent switching**: StatsView automatically reads from Supabase or the local store depending on auth state

## Bopomofo Keyboard Layout

`src/data/bopomofoLayout.ts` defines:
- `KEYBOARD_ROWS`: The full QWERTY-to-Bopomofo key mapping
- Finger assignments (color-coded: red/pink for left hand, blue for right hand)
- Used by `KeyboardDisplay.vue` and input components for UI rendering and validation

## Environment Variables

```
VITE_SUPABASE_URL          # Supabase project URL (dev: .env.local, prod: Vercel secrets)
VITE_SUPABASE_ANON_KEY     # Supabase anonymous key
VITE_RSS_API               # (Optional) Override for RSS endpoint in production
VITE_DATA_API              # (Optional) Override for English sentences endpoint in production
```

## Common Workflows

### Adding a new sentence type
1. Extend `useSentences.ts` to parse and queue the new source
2. Update the language/level toggles in PracticeView if needed
3. If using an external API, add a Vercel Edge Function in `api/` with CORS headers

### Fixing character-specific issues
1. Determine if it's IME-related: check `ChineseInput.vue` for Bopomofo, `EnglishInput.vue` for English
2. For keyboard UI issues, examine `KeyboardDisplay.vue` and `bopomofoLayout.ts`
3. To fix error tracking, update `saveRecord()` in PracticeView and the `charStats` schema in historyStore

### Debugging cloud sync
1. Verify Supabase environment variables in `.env.local` or Vercel secrets
2. Check the `useAuth()` module state and `supabase.auth.getSession()` 
3. Inspect the `typing_records` table schema and the queries in StatsView
