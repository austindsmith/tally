# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Tally is a Chrome/Firefox browser extension that automates form data entry from Google Sheets. It reads data from a user-specified Google Sheet and fills in form fields on the active tab by matching a "key" field (e.g. student name) to the corresponding row.

## Commands

```bash
npm run dev          # Start dev server with HMR (loads in browser via WXT)
npm run build        # Production build
npm run zip          # Package for distribution (Chrome Web Store)
npm run compile      # TypeScript type check only (no emit)
```

Firefox variants: `npm run dev:firefox`, `npm run build:firefox`, `npm run zip:firefox`

There is no test runner configured.

## Architecture

Built on the [WXT framework](https://wxt.dev/) which wraps Vite and provides browser extension scaffolding. WXT auto-imports `browser`, `defineBackground`, `defineContentScript`, and WXT storage utilities — no explicit imports needed.

### Entrypoints (`src/entrypoints/`)

- **`popup/`** — React app UI. `App.tsx` renders `<Content>` (view switcher) and `<Dock>` (bottom nav). Views: `Home`, `Selector`, `MasterTable`, `Settings`.
- **`content/index.ts`** — Content script injected into all tabs. Listens for three message types:
  - `START_PICK` → activates element picker on the page
  - `FILL` → executes form fill logic (`automation.ts`)
  - `READ_FIELD` → reads a field value from the page
- **`background.ts`** — Minimal service worker (currently a no-op stub).

### State (`src/store/`)

Two persisted Zustand stores:

- **`useGoogleSheet`** — Holds sheet URL, sheet ID, available sheet names, selected sheet name, and raw 2D array data. `initFromDefault()` is called on popup mount to rehydrate from stored URL.
- **`useSelectors`** — Maps each sheet column to a `{selector, role, preview}`. `role` is either `"match"` (the field used to identify the row) or `"fill"` (a field to write to). Exactly one `match` field is allowed. `startPick(column)` sends `START_PICK` to the content script; pick result is relayed back via `browser.storage.local` (IPC mechanism).

### Utils (`src/utils/`)

- **`auth.ts`** — Wraps `browser.identity.getAuthToken` / `removeCachedAuthToken` for Chrome OAuth2.
- **`googleSheets.ts`** — Fetches sheet metadata and values via the Google Sheets REST API using Bearer token auth. Handles 401 by refreshing the token.
- **`fill.ts`** — `triggerFill()` runs in the popup context. Builds a `FillRequest` from store state and sends it to the content script via `browser.tabs.sendMessage`.
- **`automation.ts`** — `executeFill()` runs in the content script. Detects single vs. batch mode (multiple table rows), reads elements, and writes values using the React-compatible `Object.getOwnPropertyDescriptor` setter pattern to trigger framework reactivity.
- **`matching.ts`** — `findMatch()` does exact-then-fuzzy (Fuse.js) name matching with normalization (strips punctuation, lowercases, sorts words alphabetically).
- **`storage.ts`** — WXT storage definitions (mostly superseded by Zustand persist, kept for legacy items).

### Key Cross-Context Pattern

The popup cannot directly manipulate page DOM. Communication flows:

1. Popup → Content: `browser.tabs.sendMessage({ type, ...payload })`
2. Content → Popup (picker only): content writes `pickResult` to `browser.storage.local`; popup's `useSelectors.checkForPick()` listens via `browser.storage.onChanged`

### Path Alias

`@/` resolves to `src/`. Use this for all cross-directory imports.

## Stack

- **WXT** — Extension framework (Manifest V3)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + **DaisyUI v5** — Use DaisyUI component classes (`btn`, `badge`, `select`, `fieldset`, `dock`, etc.)
- **Zustand v5** with `persist` middleware (storage key `"google-storage"` and `"selectors-storage"`)
- **Fuse.js** — Fuzzy string matching
- **@medv/finder** — Generates unique CSS selectors for picked elements
- **html-element-picker** — Visual hover-to-pick UI overlay
