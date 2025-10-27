# UI Refresh Work Plan

## Scope Overview
- Reshape the AI Chat experience into a chat-first layout while keeping the wider two-column shell intact for now.
- Convert Web Crawler, Game Plan X, and Simulation tools to a single-column layout consistent with Deal Hunter.
- Simplify the Web Crawler experience (no chat terminal, tightened spacing, enlarged metric typography, color refinements).
- Update shared card patterns (taller layout, consistent button placement, improved tag spacing, medium-risk contrast).
- Introduce brand-aligned highlight colors for Web Crawler status states (pale yellow/green/red).

## Workstream Breakdown

### 1. Audit & Inventory
- Trace how the current three-column layout (`app/page.tsx`) toggles `HyperComputerTerminal` vs. `ResultsPanel`.
- Catalog card components that will need layout tweaks (`components/deal-card.tsx`, `components/tools/*-results-panel.tsx`, `components/deal-evaluation-interface.tsx`).
- Identify Web Crawler specific UI (primarily `components/tools/crawler-results-panel.tsx`) and shared utility styles.

### 2. Design Specification Translation
- Define exact spacing, sizing, and typography adjustments (e.g., 20 px gap between “Start Discovery” and results, +15 % metric typography).
- Establish the pale yellow/green/red tokens (needs exact hex codes).
- Determine how “buttons locked to bottom” interacts with existing responsive behavior in card components.

### 3. Layout Refactors
- AI Chat: disable file upload/document submission affordances in `HyperComputerTerminal` while preserving chat prompt flow.
- Web Crawler + other tools: bypass the terminal column in `app/page.tsx` and render `ResultsPanel` full width; remove chat hooks from crawler experience.
- Game Plan X: remove terminal/console view and align with single-column pattern; ensure Simulation mirrors this.

### 4. Visual & Component Tweaks
- Apply new spacing/height rules to shared card components; ensure tags and buttons have consistent vertical rhythm.
- Update Web Crawler sentiment/urgency styling with the new color palette and increased metric sizing.
- Verify medium-risk contrast meets accessibility targets (likely adjust existing secondary/destructive tokens or define new ones).

### 5. Verification
- Manually regression-test each tool tab to confirm layout parity (desktop first, note any mobile follow-up).
- Capture before/after screenshots for stakeholder review.
- Document any dependencies on backend data (e.g., empty states) for QA coordination.

## Key Files / Modules
- `app/page.tsx` (layout switching logic)
- `components/hyper-computer-terminal.tsx`
- `components/results-panel.tsx`
- `components/tools/chat-results-panel.tsx`
- `components/tools/crawler-results-panel.tsx`
- `components/tools/gameplan-results-panel.tsx`
- `components/tools/simulation-results-panel.tsx`
- `components/deal-card.tsx` & related card renderers
- Shared UI tokens in `components/ui` and `app/globals.css`

## Decisions & Clarifications
- **Web Crawler palette:** We will propose new pale yellow/green/red tokens that fit the existing system and meet contrast guidelines, then wire them into the crawler status visuals.
- **AI Chat:** Keep the current layout; confirm there are no document-upload affordances in that tab and hide any stray context UI if found.
- **Card updates:** Apply taller layout, bottom-aligned buttons, and increased metric sizing to all card-based surfaces (Deal Hunter, Game Plan X, Simulation, Crawler).
- **Single-column layout:** Web Crawler, Game Plan X, and Simulation should mirror Deal Hunter’s single-column structure and spacing exactly.
- **Medium-risk contrast:** Select an accessible color variant during implementation (no existing guideline provided).
