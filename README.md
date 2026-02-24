# Yanex

React + Firebase starter with:
- Email/password authentication
- Google sign-in authentication
- Firestore profile storage
- Structured diagnostics logging + in-app Diagnostics screen

## 1) Install

```bash
npm install
```

## 2) Configure Firebase

Copy env template:

```bash
cp .env.example .env.local
```

Fill values from your Firebase project settings.

Enable auth providers in Firebase Console:
- Authentication -> Sign-in method -> Email/Password
- Authentication -> Sign-in method -> Google

## 3) Run

```bash
npm run dev
```

## 4) Firebase Hosting

Set your Firebase project id in `.firebaserc`:

```bash
firebase use --add
```

Deploy:

```bash
npm run deploy:hosting
```

Optional local hosting emulator:

```bash
npm run hosting:emulate
```

## Architecture

- `src/core/*`: core services (firebase, auth, db, logging, diagnostics) with no React dependency.
- `src/providers/*`: React context wiring.
- `src/screens/*`: UI-only views.

Core services emit verbose structured logs to console. The Diagnostics screen subscribes to the same logging stream for timeline inspection.
