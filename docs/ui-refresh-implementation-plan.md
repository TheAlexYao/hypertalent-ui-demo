# UI Refresh Implementation Plan

**Progress:** 0 %

- ⏳ Define layout adjustments in `app/page.tsx` so AI Chat keeps the terminal while the results column defaults to ~352 px and clamps between 320–480 px.
- ⏳ Refactor `ResultsPanel` so AI Chat omits talent selection and document upload scaffolding but retains its existing content blocks.
- ⏳ Rework Web Crawler, GamePlan X, and Simulation flows to reuse Deal Hunter’s single-column pattern with Drive-link context and no terminal hooks.
- ⏳ Update shared card components (`components/deal-card.tsx`, tool-specific cards, `DealEvaluationInterface`) for taller spacing, bottom-aligned actions, and mobile responsiveness.
- ⏳ Introduce new highlight tokens for Web Crawler status states and a medium-risk contrast color, then apply them across the affected components.
