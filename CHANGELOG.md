# Changelog

This file documents the changes, experiments, and decisions made during development sessions.

## Session: 2026-03-14

### Removed
- **Unused dependencies**: Uninstalled `motion`, `@google/genai`, `express`, and `@types/express`. All four were pre-installed by AI Studio's project template but were never imported anywhere in the codebase. Removing them reduces bundle size and eliminates confusion about what the project actually uses.
- **Dead Gemini config**: Removed the `GEMINI_API_KEY` define from `vite.config.ts`, which was exposing an unused environment variable to the frontend.

### Changed
- **AI_INSTRUCTIONS.md replaced**: Superseded by `CLAUDE.md` at the repo root, which serves as the canonical AI development guide for this project. The old file is no longer needed.
- **API URL centralized**: The Yesstreaming API base URL (`https://ec2.yesstreaming.net:1150`) was hardcoded in 5 places across 3 files (`useRadioData.ts`, `TrackRequestModal.tsx`, `NowPlaying.tsx`). Extracted into a single constant `API_BASE_URL` in the new file `src/utils/constants.ts`. Future URL changes now require a single edit.

---

## Session: 2026-03-13

### Added
- **Left Sidebar (Station Menu)**: Introduced a new collapsible left sidebar to house secondary features, accessible via a new Menu icon in the top-left header.
- **Google Calendar Integration**: Added an expandable "Schedule" section in the left sidebar containing a Google Calendar iframe.

### Changed
- **Right Sidebar (Chat) Toggle**: Made the live chat sidebar collapsible to allow users to maximize the main content area. Added toggle buttons in the header and the sidebar itself. Removed the floating vertical toggle button to clean up the UI.
- **Header Branding**: Updated the main header title from "CyberMetal" to "CYBER METAL RADIO" and the subtitle from "Stream Companion" to "WEB PLAYER APP v1".
- **Mobile Live Indicator**: Restored the live listener count indicator on mobile screens. 

### Fixed
- **Calendar Layout & Theming**: 
  - *What we tried*: Initially embedded the default monthly calendar view.
  - *Why it didn't work*: It was too cramped in the 320px sidebar and the bright white background clashed with the dark theme.
  - *What we kept*: Switched the iframe to Agenda mode (`mode=AGENDA`) and hid unnecessary Google UI elements. Applied a CSS filter hack (`invert hue-rotate-180 opacity-90 mix-blend-screen`) to force a dark mode that perfectly matches our neon/dark aesthetic.
- **Calendar Scrollbar Issue**: 
  - *What we tried*: The calendar iframe was causing a horizontal scrollbar.
  - *What we kept*: Increased the left sidebar width on desktop to `w-96` (matching the right sidebar) and removed the padding around the iframe container to give it maximum horizontal breathing room.
- **Scrolling Title Issue**: 
  - *What we tried*: The `h2` element itself was animating, which caused its bounding box to slide out of the container when inspected or interacted with. We then wrapped it in a span, but the `paddingRight: 100%` caused a huge gap before the text looped, leaving the container empty for a long time.
  - *What we kept*: Implemented a seamless marquee by duplicating the text when it overflows. The animation now translates to `-50%` instead of `-100%`, so as the first text scrolls out, the second identical text follows immediately behind it, creating a continuous loop without empty gaps.
- **Mobile Header Spacing**: Hid the word "Listeners" on mobile devices so the live indicator fits cleanly next to the logo and audio controls without breaking the layout.
- **Header Layout Refinement**: Added subtle padding to the audio player container in the header to improve visual spacing between the player and the chat toggle button.
