# Hyper Talent Auth Flow: Backend Options

_Last updated: 2025-XX-XX_

## Executive Summary

Production Google OAuth currently stalls because the FastAPI backend redirects users to the internal HTTP ALB host. The popup never reaches our Next.js callback, so the session ID can’t be delivered to the UI. There are three viable paths to resolve this:

1. **Harden the existing ALB + FastAPI flow** by teaching FastAPI to derive redirect URIs from forwarded headers (fixing the immediate bug).
2. **Serve FastAPI over HTTPS and issue HttpOnly cookies**, eliminating the custom proxy and header juggling.
3. **Adopt an AWS-managed auth layer** (Cognito Hosted UI or ALB OIDC) so Google OAuth completes entirely on AWS, and the app consumes standard cookies/tokens.

The table below compares effort, risk, and impact.

| Option | Effort | Risk | User Impact | Notes |
| ------ | ------ | ---- | ----------- | ----- |
| 1. Fix current proxy | Medium | Medium | Low | Requires header logic + Google console updates; keeps custom session plumbing. |
| 2. Move to HTTPS cookies | Medium | Low | Low | Simplifies frontend, relies on FastAPI issuing secure cookies. |
| 3. AWS-managed auth | High (initial) | Low (long term) | Low | Larger migration but offloads OAuth, tokens, refresh logic to AWS. |

## Current State (Production)

- Frontend (Vercel) opens `/api/auth/login` → Next.js proxies to FastAPI `/auth/login`.
- FastAPI returns Google authorization URL that embeds `http://hypertalent-backend-alb-…elb.amazonaws.com/auth/callback`.
- After the user authorizes, Google redirects to that HTTP endpoint. Browsers block or time out because the ALB host is HTTP and may not be publicly routable.
- Result: popup spins, and `/auth/status` polling fails indefinitely.

## Option 1 — Fix the Existing Proxy Flow

### Summary

Keep the current architecture (Next.js proxy + FastAPI JSON callback), but ensure FastAPI sees the real browser origin and produces a reachable redirect URL.

### Required Backend Changes

1. Read `x-forwarded-host`, `x-forwarded-proto`, `x-forwarded-port`, `x-forwarded-for`, and `origin` from incoming requests. These are now forwarded by `/api/auth/login` in the frontend.
2. When generating Google auth URLs and verifying callbacks, build the redirect URI with those forwarded values (e.g., `https://hypertalent.vercel.app/api/backend/auth/callback`).
3. Set `FORWARDED_ALLOW_IPS=*` (or equivalent) in Uvicorn/Gunicorn so the framework trusts the forwarded headers.
4. Update the Google Cloud OAuth client’s Authorized redirect URIs to include:
   - `https://hypertalent.vercel.app/api/backend/auth/callback`
   - Any staging/local equivalents.
5. Ensure the ALB forwards the same headers to FastAPI. (Most AWS load balancers already do.)

### Frontend Status

- `/api/auth/login` forwards all relevant headers.
- `/api/backend/auth/callback` stores the `session_id`, broadcasts it, and closes the popup.
- `AuthProvider` listens for BroadcastChannel/storage events and refreshes `/auth/status`.

### Pros / Cons

- ✅ Fixes production quickly without infrastructure changes.
- ✅ No AWS re-architecture needed.
- ❌ Still relies on custom JavaScript storage + `X-Session-ID` headers.
- ❌ Future maintenance load (cookie upgrades, cross-tab sync, etc.).

## Option 2 — Serve FastAPI via HTTPS + HttpOnly Cookies

### Summary

Expose FastAPI on an HTTPS domain (e.g., `https://api.hypertalent.com`) and let it manage session cookies. Frontend calls the API directly with `credentials: "include"`; no proxy or session broadcasting needed.

### Backend Tasks

1. Attach an ACM certificate to the ALB and create an HTTPS listener.
2. Configure DNS (Route53) so `api.hypertalent.com` points to the ALB.
3. Update FastAPI auth callback to set secure, HttpOnly cookies instead of returning raw `session_id`.
4. Adjust CORS to allow `https://hypertalent.vercel.app` with credentials.

### Frontend Adjustments

1. Set `NEXT_PUBLIC_API_BASE_URL=https://api.hypertalent.com`.
2. Remove the `/api/backend/[...path]` proxy or keep only as a thin pass-through.
3. Drop custom `X-Session-ID` logic; rely on `credentials: "include"`.

### Pros / Cons

- ✅ Simplifies client code (cookie-based auth is standard).
- ✅ Reduces security surface (no session IDs in JS).
- ❌ Requires TLS setup and DNS changes.
- ❌ Still self-manages auth lifecycle (refresh, logout) on FastAPI.

## Option 3 — Adopt AWS-Managed Authentication

Two AWS-native patterns offload OAuth and session issuance to AWS.

### 3A. Amazon Cognito Hosted UI

- Configure a Cognito User Pool, add Google as an identity provider, and register the frontend domain as the callback.
- Frontend redirects users to Cognito’s hosted UI; after Google login, Cognito sets secure cookies or returns tokens.
- Protect API routes using Cognito authorizers (API Gateway) or verify Cognito JWTs in FastAPI.

**Pros:** Built-in token refresh, multi-factor support, fine-grained policies.  
**Cons:** Highest upfront integration effort; requires learning Cognito and updating infra.

### 3B. ALB + OIDC Authentication

- Configure the ALB to authenticate requests via Google OIDC (built-in feature).
- Mark FastAPI target group paths as “authenticate,” so the ALB handles OAuth redirects.
- FastAPI receives requests with `x-amzn-oidc-data` and validated JWT claims.

**Pros:** Minimal backend changes; ALB manages cookies and tokens.  
**Cons:** Less flexible than Cognito (e.g., no custom user database), but lowest effort among AWS-managed options.

### Common Steps for Both

1. Set up HTTPS on the ALB or API Gateway (required).
2. Update Google OAuth scopes/redirect URIs to match the AWS-managed flow.
3. Remove custom session logic from the frontend; rely on cookies or AWS-issued tokens.

## Recommendation

- **Short-term unblock:** Implement Option 1 to restore login immediately by fixing redirect URIs.
- **Mid-term cleanup:** Plan for Option 2 or 3 to eliminate custom session plumbing and align with standard OAuth/Cookie practices.
- **Long-term scalability:** Option 3 (Cognito or ALB OIDC) provides the most robust footing as the platform grows.

## Appendix: Verification Checklist (All Options)

- [ ] Google OAuth consent screen reaches our callback URL without timeouts.
- [ ] `/auth/status` returns `authenticated: true` in the browser after login.
- [ ] New tabs inherit the authenticated session (no manual refresh required).
- [ ] API responses include user data; requests show either `X-Session-ID`, AWS JWT headers, or cookies (depending on option).
- [ ] Logout clears sessions in all tabs.

