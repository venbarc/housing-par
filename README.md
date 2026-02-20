# Hospital Bed Management App

Next.js (App Router) + Firebase (Firestore + Storage) dashboard for live hospital bed management with drag-and-drop layout, patient assignment, documents, and notifications.

## Setup
1. Copy `.env.example` to `.env.local` and fill Firebase service account + client config.
2. Install deps (already installed here): `npm install`.
3. Run dev server: `npm run dev` (http://localhost:3000).
4. Optional seed sample data (requires env set): `npx tsx scripts/seed.ts` or transpile the file to JS and run with node.

## Features
- Realtime Firestore listeners for beds, patients, documents, notifications, wards.
- Drag-and-drop bed positioning persisted via `/api/beds/[id]/position`.
- Bed/Patient CRUD, assign/discharge guards, notification log.
- Document upload to Firebase Storage with signed download URLs.
- Modern UI: Tailwind, dnd-kit, Framer Motion accents, toasts.

## Testing
- Unit: `npm test` (vitest) – example validation test included.

## Environment keys
```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."
FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"","authDomain":"","projectId":"","storageBucket":"","messagingSenderId":"","appId":""}
UPLOAD_MAX_MB=20
APP_BASE_URL=http://localhost:3000
```
