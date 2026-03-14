# CMR Player

A feature-rich web player for **[Cyber Metal Radio](https://www.cybermetalradio.com)** — a live metal internet radio station. Built as a frontend-only SPA to give listeners a proper UI instead of a bare stream link.

## Preview

<table>
  <tr>
    <td align="center"><strong>Desktop</strong></td>
    <td align="center"><strong>Mobile</strong></td>
  </tr>
  <tr>
    <td><img src="docs/screenshot-desktop.png" alt="Desktop view" width="600"/></td>
    <td><img src="docs/screenshot-mobile.png" alt="Mobile view" width="280"/></td>
  </tr>
</table>

## Features

- **Live stream playback** — play/pause and volume control
- **Now Playing card** — album artwork, scrolling track title, artist, and vote counts
- **Like/Dislike voting** — rate tracks as they play
- **Song requests** — search the station library, pick a track, and add a dedication message
- **Play history** — last 14 tracks with timestamps
- **Live listener count** — see who's tuned in
- **Embedded Discord chat** — WidgetBot iframe, collapsible sidebar on desktop
- **Station schedule** — Google Calendar in agenda mode with a CSS dark-mode filter
- **Responsive layout** — works on mobile and desktop with a cyberpunk dark/cyan aesthetic

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |

Frontend only — no backend, no server-side logic.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Runs at http://localhost:3000

# Type-check
npm run lint

# Production build
npm run build
```

## Project Structure

```
src/
├── components/          # UI components (Header, NowPlaying, HistoryList, etc.)
├── hooks/
│   └── useRadioData.ts  # All API polling and state lives here
└── utils/
    └── constants.ts     # API_BASE_URL and shared constants
```

All external data flows through `useRadioData.ts`. This is intentional — it keeps polling logic, cleanup, and API shape knowledge in one place.

## Notes

- Dark mode only by design
- The station API has two layers (v2 and Tastypie) that return differently shaped responses — see `useRadioData.ts` for handling
- Track requests use GET despite being a write operation (station API quirk)
