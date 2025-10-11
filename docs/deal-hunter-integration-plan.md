# Deal Hunter Frontend ↔ Backend Integration Plan

Last updated: 2025-10-11  
Branch: `feature/deal-hunter-integration`

## Objectives
- Replace demo-only logic in the Deal Hunter experience with live data from the FastAPI backend.
- Preserve the existing multi-tool UI while wiring Deal Hunter to authenticated backend requests.
- Establish reusable auth, transport, and typing utilities that other tools can adopt as their endpoints come online.

## Prerequisites
- Backend ALB: `http://hypertalent-backend-alb-508528901.us-east-1.elb.amazonaws.com`
- Swagger docs: `/docs`, OpenAPI schema `/openapi.json`
- Google OAuth configured on the backend (browser-based session cookies)
- Frontend env var: `NEXT_PUBLIC_API_BASE_URL` pointing at the ALB (HTTP for now)
- Feature branch created from `main`: `git checkout -b feature/deal-hunter-integration`

## Workstream Breakdown

### 1. Backend Contract Intake
1. Download `/openapi.json` (includes `/drive/*` endpoints such as `/drive/analyze-talent` and `/drive/spreadsheet/{folder_id}`) and commit a snapshot (e.g., `docs/openapi-deal-hunter.json`) for reference.
2. Generate/hand-write TypeScript interfaces for:
   - Auth status (`/auth/status`)
   - Deal search request/response (`/api/deals/search`)
   - Deal status polling (`/api/deals/status/{id}`)
   - Drive analysis/spreadsheet endpoints (`/drive/analyze-talent`, `/drive/spreadsheet/{folder_id}`)
3. Confirm required request fields (`prompt`, `drive_link`, optional metadata) and response shapes with Malik.

### 2. Shared API Utilities
1. Create `lib/config.ts` exporting the resolved API base URL and feature flags.
2. Add `utils/api-client.ts` (or similar) that wraps `fetch` with:
   - Base URL prefix
   - `credentials: "include"` for Google OAuth cookies
   - Standard JSON parsing + error normalization
3. Provide helper functions/hooks, e.g., `getAuthStatus`, `login`, `createDealSearch`, `getDealSearchStatus`.

### 3. Auth Integration
1. Refactor `components/auth/auth-provider.tsx` to:
   - Call `getAuthStatus` on mount.
   - Expose `login()` that redirects to `/auth/login` (likely `window.location.href = ...`).
   - Expose `logout()` if the backend supplies an endpoint, or clear cookies/local state as instructed.
2. Update `ProtectedRoute` to rely on real auth state, keeping spinner/placeholder UX intact.
3. Remove auto-login/localStorage mocks once the backend flow is confirmed.
4. Leave the shared layout (`app/page.tsx`) untouched structurally—any new providers/hooks get layered in without removing existing non–Deal Hunter tools.

### 4. Deal Hunter Form Updates
1. Expand the existing panel to collect:
   - `drive_link` (validated Google Drive *folder* URL only—file URLs are not accepted).
   - `prompt` (multi-line text)
   - Optional metadata (e.g., talent selection) passed through with the request.
2. Preserve the current “Upload Documents” UI in `FileUploadZone`, but repurpose the primary action button to open a modal where the user pastes the Google Drive folder link instead of uploading local files. Reject non-folder URLs before closing the modal.
3. Maintain the existing layout by storing the accepted folder URL in component state (and localStorage if desired), surfacing it back to users via a badge/summary next to the upload section with edit/remove actions. Show a “Last search” chip that references the `search_id` once a job is created.
4. Keep `FileUploadZone` APIs backward compatible so Talent Profile Manager and other tools keep working; use optional props (e.g., `onOpenDriveModal`) to activate Deal Hunter–specific behavior.
5. Hook the submit button to `createDealSearch`, saving the returned `search_id` and ensuring the `drive_link` state is included. If we leverage `/drive/spreadsheet/{folder_id}`, capture the returned Google Sheets URL and surface it alongside the in-app results.

### 5. Background Status & Results
1. Build a polling hook (`useDealSearchStatus`) that:
   - Polls `/api/deals/status/{id}` at an interval (e.g., 2–3s) until `status === "completed"` or error.
   - Supports manual refresh/cancel.
2. Replace the simulated agent steps in `AIDealDiscoveryEngine` with backend status fields:
   - Map `queued` → “File Processor” running, `in_progress` → sequential agent updates, `completed` → success summary, `failed` → error card with reason.
   - Surface backend progress metrics (e.g., `records_processed`, `insights_generated`) when provided.
3. Persist the active `search_id` (e.g., in localStorage) so unfinished searches resume polling after refresh; display the ID in the UI for reference/debugging.
4. When results arrive, map them into the existing `Deal` type and feed `DealEvaluationInterface` + outreach/export components. Also surface any `spreadsheet_url` returned (from `/drive/spreadsheet/{folder_id}` or status payloads) so users can open the generated sheet directly.

### 6. Error & Edge Case Handling
1. Surface auth failures by prompting users to log in again.
2. Handle validation errors (422) with inline messaging on the Drive link/prompt fields.
3. Display backend job failures in the discovery panel with retry options.
4. Gracefully handle empty result sets.
5. Implement a global `401` handler that redirects users to `/auth/login` (Google OAuth) and retries pending requests after re-authentication.

### 7. Configuration & Deployment
1. Document required env vars in `README.md` (frontend) and ensure `.env.local.example` is updated if present.
2. For local dev, provide instructions for proxying HTTPS → HTTP or note CORS requirements.
3. Validate CORS/session cookie behavior between the frontend origin and ALB; capture any headers the backend needs adjusted.
4. Update CI/CD to build against the new feature branch if necessary.

### 8. Testing & Verification
1. Manual end-to-end run in a browser:
   - Hit `/auth/login`, complete Google OAuth, confirm `/auth/status` returns authenticated.
   - Submit a Drive link + prompt, track status to completion, verify deals render.
2. Validate Drive-link modal: reject non-folder URLs, allow editing/removal, ensure the stored link persists across refresh if required.
3. Confirm spreadsheet generation: when a search completes (or when `/drive/spreadsheet/{folder_id}` is invoked), the returned Google Sheets URL opens and contains the expected data.
4. Record sample responses and edge cases (empty results, backend error, 401 redirect, missing spreadsheet URL) for QA.
5. Add lightweight unit tests for the new API utilities/hooks if the project testing setup allows (TBD).

### 9. Rollout Plan
1. Once verified, raise a PR from `feature/deal-hunter-integration` → `main`.
2. Coordinate with Malik on any backend config/CORS changes before merge.
3. After Deal Hunter is live, clone the service layer pattern for other tools:
   - `crawler`, `gameplan`, `simulation`, `chat` using their upcoming endpoints.

## Open Questions
- Does the backend expose a logout endpoint (`/auth/logout`)? If not, how should frontends end the session?
- What ancillary metadata (talent ID, tags) should be passed to `/api/deals/search`?
- Are there rate limits or max concurrent searches the frontend should respect?
- Timeline for HTTPS termination on the ALB (important for production).
- Will the backend deliver additional fields (e.g., AI insights, rationale) that require extending `types/deal.ts` or introducing new types?
- Should the frontend prefer the `/api/deals` async flow, the `/drive/analyze-talent` + `/drive/spreadsheet/{folder_id}` flow, or a combination (e.g., async status plus final spreadsheet export)?

## Next Actions
1. ✅ Create feature branch (`feature/deal-hunter-integration`).
2. ✅ Draft integration plan (`docs/deal-hunter-integration-plan.md`).
3. ⬜ Pull OpenAPI schema and start implementing Workstreams 1–3 over the weekend.
