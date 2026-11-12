# Production API Verification

Verification date: 2026-11-12 (Asia/Kolkata)

## Verified Production URL

`https://makeable-jobs-api.onrender.com/api/v1`

This URL was taken from the Flutter client configuration and deployment
documentation, then verified by live DNS and HTTP checks. It was not guessed.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| DNS | Pass | `makeable-jobs-api.onrender.com` resolved to Render/Cloudflare addresses. |
| HTTPS health | Pass | `GET /health` returned HTTP 200 with production environment metadata. |
| OpenAPI | Pass | `GET /api/v1/openapi.json` returned HTTP 200. |
| Login route exists | Pass | OpenAPI publishes `POST /api/v1/auth/login`. |
| Invalid request validation | Pass | A deliberately invalid email produced HTTP 422 validation output. |
| Phone network reachability | Pass | The connected Android phone resolved and pinged the Render hostname. |
| Valid account login | Not run | Requires a user-provided valid account or interactive device credentials. |
| Firebase Admin verification | Not run | Requires a real Firebase Google sign-in token and deployment log access. |
| Supabase connectivity | Indirect only | Health endpoint was live, but no deployment dashboard or database access was available. |
| Render logs | Not available | No Render dashboard credentials were available in this session. |

## Contract Observations

- Login is JSON `POST /api/v1/auth/login` with `email` and `password`.
- The backend exposes `access_token`, `refresh_token`, and `token_type` through
  its `TokenPair` response model.
- Google sign-in posts a Firebase ID token to `/api/v1/auth/google`; it does not
  accept a client-provided user ID.
- The app must use `Authorization: Bearer <access_token>` for protected routes.

## Outcome

The verified Render API was available at the time of testing. The current
generic Flutter error cannot be treated as proof that the API is down.
