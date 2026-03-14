# CLAUDE.md — CMR Player

Project context and behavioral rules for AI-assisted development.
Decision history lives in `CHANGELOG.md`. Update it when making structural changes.

---

## Project Overview

A frontend-only web player for Cyber Metal Radio — a live metal internet radio station.
Gives listeners a feature-rich UI instead of a bare stream link.

**What exists:**
- Live stream playback with play/pause/volume
- Now Playing card (artwork, scrolling title, artist, vote counts)
- Like/dislike voting
- Song request modal (search library, pick track, add dedication)
- Play history (last 14 tracks with timestamps)
- Live listener count
- Embedded Discord chat (WidgetBot iframe)
- Station schedule (Google Calendar iframe, agenda mode, CSS dark-mode filter)
- Responsive layout — cyberpunk dark/cyan aesthetic

**What doesn't exist yet:**
- Any backend or server-side logic
- AI features (Gemini key removed — not planned)

---

## Stack & Constraints

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| State | useState, useEffect, useRef, useCallback — no Redux/Zustand/Context |
| Environment | Browser only. No Node.js backend. |

Dark mode only. Color palette: `zinc-950`, `zinc-900`, neon cyan accents.

---

## File Structure

```
cmr-player/
├── src/
│   ├── components/          # UI components
│   ├── hooks/
│   │   └── useRadioData.ts  # Single polling hook — all API state lives here
│   └── utils/
│       └── constants.ts     # API_BASE_URL and shared constants
├── cmr assets/              # Static station assets
├── .github/
│   └── AI_INSTRUCTIONS.md   # Legacy prompt doc (superseded by this file)
├── CHANGELOG.md             # Decision history — update when making structural changes
├── index.html
└── vite.config.ts
```

**Key constraint:** All external data flows through `useRadioData.ts`.
New data requirements go in this hook unless there's a clear reason not to — log that reason in the CHANGELOG.

---

## Critical API Rules

The station API lives at `API_BASE_URL` (defined in `src/utils/constants.ts`).
It hosts **two different API layers** that respond differently. Getting this wrong silently breaks data.

### Two API Layers

| Layer | Example endpoints | Response format |
|---|---|---|
| v2 | `/api/v2/history/`, `/api/v2/channels/` | Bare JSON — access directly: `data[0].title` |
| Tastypie | `/api/allmusic/`, `/api/playrequest/` | Wrapped JSON — must extract: `data.objects[0].title` |

### Security Rule
**Never use `/api/channels/`** (Tastypie). It leaks stream keys.
Always use `/api/v2/channels/` for stream status.

### CORS & Fetching
CORS is enabled. Use standard `fetch()`. No proxy needed.

### Polling Cleanup
Every `setInterval` / `setTimeout` in a `useEffect` **must** have a cleanup function.
Missing cleanup = memory leaks + API spam.

```typescript
useEffect(() => {
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval); // required
}, []);
```

### Progress Bar Math
The API does not provide current playback position. Calculate it from history:

```typescript
const elapsed = Date.now() - history[0].ts;
const percentage = (elapsed / history[0].length) * 100;
```

### Track Request Endpoint
`/api/playrequest/add/` **only accepts GET requests** despite being a write operation.
Do not use POST here.

---

## Behavioral Rules

### Plan Before Implementing
For any new feature or non-trivial change: state the plan and which files will be touched.
Wait for approval before writing code.

### Strict Scope
Only modify lines necessary for the requested task.
Do not refactor, reorganize, or "improve" surrounding code unless asked.
If something nearby is broken or will cause problems, flag it — don't silently fix it.

### When Complexity Blocks Progress
If a task requires extensive or high-impact rewriting, or if there's a genuine knowledge gap:
**Stop.** Present 2–3 options with complexity and tradeoff assessment. Wait for a decision.
Don't push through and hope for the best.

### Options Format
When presenting options:
- What it is in plain terms
- Pros / cons
- Rough complexity (simple / moderate / complex)
- What it locks in or rules out

### New Dependencies
Ask before installing any new npm package. No exceptions.

### UI/UX Changes
For new visual features: ask about layout, placement, and design intent before building.
The aesthetic is established — changes should fit the cyberpunk dark/cyan language, not introduce new patterns.

### Recommendations
If a requested approach has a clearly better alternative for long-term maintainability, recommend it first.
Do not implement the alternative without permission.

### After Completing a Feature
Provide a short testing checklist so changes can be verified manually.

---

## Code Style

- Functional components only — no class components
- TypeScript throughout — no `any` unless genuinely unavoidable, and flag it when used
- Async/await for all fetch operations, wrapped in try/catch
- Fail silently on image load errors — fall back to a Lucide icon
- Handle loading and error states — the UI should never render broken
- Comments explain *why*, not *what* — avoid tutorial-style inline prose
- Keep components focused — if a component is doing too many things, flag it before adding more

---

## CHANGELOG Protocol

`CHANGELOG.md` is the decision record for this project.

When a structural change is made (new component, hook refactor, API pattern change, dependency added/removed, architectural decision), add a CHANGELOG entry that covers:
- What changed
- What was tried if anything failed or was iterated on
- Why the final approach was chosen

Entries don't need to be long — but the "what we tried / why it didn't work / what we kept" format
(already established in the existing CHANGELOG) should be preserved for non-trivial decisions.
