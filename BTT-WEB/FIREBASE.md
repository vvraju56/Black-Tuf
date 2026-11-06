# Firebase Integration — BlackTuf Technologies

This document describes how Firebase is integrated into the BlackTuf Technologies
website and how to deploy it.

## Responsibilities

- **MongoDB Atlas** is the source of truth for products, categories, services,
  contact messages, support tickets, changelogs, and admin profiles/roles.
- **Firebase** provides real-time notifications, real-time dashboard updates,
  admin authentication, product image uploads, push notifications, and hosting.

Firebase does NOT duplicate the MongoDB database. Firestore only carries
lightweight change events.

## Firebase services used

| Service | Purpose |
| --- | --- |
| Firebase Authentication | Admin login, logout, password reset, ID token verification |
| Cloud Firestore | Real-time change events (outbox pattern) |
| Firebase Cloud Messaging | Browser push notifications |
| Firebase Cloud Storage | Product logos, screenshots, banners, company assets |
| Firebase App Hosting | Next.js deployment (production build, GitHub integration) |
| Firebase Admin SDK | Server-side token verification and secure operations |

## Environment variables

### Frontend (`frontend/.env.local`)

See `frontend/.env.example`.

### Backend (`backend/.env`)

See `backend/.env.example`. Configure Firebase Admin credentials through the
hosting environment's secure service identity or Secret Manager. Never expose
service-account private keys in browser code. For local development, set
`FIREBASE_SERVICE_ACCOUNT_JSON` to the full service-account JSON.

## Security rules

- `firestore.rules` — events readable by authenticated admins only; writes
  server-side only.
- `storage.rules` — product images publicly readable; writes restricted to
  authenticated admins with size/type limits.

## Deployment

### Backend (Express + MongoDB)

Deploy `backend/` to a Node host (Cloud Run recommended) or migrate endpoints
into Next.js server routes. Set `MONGODB_URI`, `JWT_SECRET` (or Firebase
credentials), `NODE_ENV=production`, `PORT`, `FRONTEND_URL`, and Cloudinary
variables. Run seed scripts once against production.

### Frontend (Firebase App Hosting)

1. Connect the GitHub repository to Firebase App Hosting.
2. Configure environment variables and secrets in the Firebase console.
3. Firebase App Hosting builds and deploys automatically on push to `main`.
4. Configure a custom domain and HTTPS in the Firebase console.

## Real-time flow

1. Admin mutates a product via the API.
2. Backend validates the request and verifies the Firebase ID token + role.
3. Change is saved to MongoDB.
4. A lightweight event is published to Firestore (with retries / outbox).
5. The website listens via `onSnapshot()` and refetches from the backend.
6. Affected pages, cards, search results, and footer refresh.

## Push notifications

- Permission is requested only after user interaction.
- A Firebase Messaging service worker is registered (`/firebase-messaging-sw.js`).
- FCM tokens are stored securely and refreshed/invalidated as needed.
- Notification preferences are supported.
- Push payloads never contain confidential information.

## Checks

Run before deploying:

```bash
npm run typecheck
npm run build
```

## Branding

BlackTuf Technologies branding, the responsive dark gradient design, the
`#ff79ee` accent, and the `@blacktuftech` support identity in the footer are
preserved.