# task-manager-desktop

Electron desktop app (Windows, Mac, Linux) for the Task Manager. Full task management with Google Calendar sync, powered by the same shared business logic as the mobile app.

## Prerequisites

- Node.js 18+, Yarn
- A GitHub Personal Access Token with `read:packages` scope (to install `@noctilumina/task-manager-shared` from GitHub Packages)

## First-time setup

### 1. Create your .env file

```powershell
cd C:\Users\irisp\task-manager-desktop
copy .env.example .env
```

Open `.env` and fill in your values. Find Firebase config at **https://console.firebase.google.com/project/task-manager-79da0/settings/general** → Your apps → Web app:

```
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=task-manager-79da0.firebaseapp.com
FIREBASE_PROJECT_ID=task-manager-79da0
FIREBASE_STORAGE_BUCKET=task-manager-79da0.appspot.com
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
GOOGLE_WEB_CLIENT_ID=....apps.googleusercontent.com
N8N_WEBHOOK_URL=http://localhost:5678
```

Find `GOOGLE_WEB_CLIENT_ID` at **https://console.cloud.google.com/apis/credentials?project=task-manager-79da0** — copy the Client ID from the "Web client (auto created by Google Service)" entry.

### 2. Set your GitHub token for package install

**PowerShell:**
```powershell
$env:GITHUB_TOKEN="your_github_pat_here"
```

**Command Prompt:**
```cmd
set GITHUB_TOKEN=your_github_pat_here
```

### 3. Install dependencies

```powershell
yarn install
```

### 4. Build and run

```powershell
yarn build
yarn start
```

The Electron window will open. Sign in with Google to access your tasks.

## Development (watch mode)

```powershell
yarn dev
```

This runs TypeScript in watch mode and restarts Electron on changes.

## Running E2E tests

```powershell
yarn test
```

Requires the app to be built first (`yarn build`).

## Project structure

```
src/
├── main.ts           Electron main process (BrowserWindow)
├── preload.ts        Context bridge (renderer ↔ main)
├── renderer.tsx      React entry point
├── App.tsx           Root component — auth state listener
└── screens/
    ├── LoginScreen.tsx     Google sign-in
    └── TaskListScreen.tsx  Task list, add, complete, delete, sort
index.html            Renderer HTML shell
e2e/
└── taskFlow.spec.ts  Playwright E2E tests
```

## Key dependencies

| Package | Purpose |
|---------|---------|
| `@noctilumina/task-manager-shared` | Shared business logic (TaskService, SyncService, types) |
| `firebase` | Firebase Web SDK (Auth + Firestore) |
| `electron` | Desktop app framework |
| `react` + `react-dom` | UI renderer |
| `@playwright/test` | E2E testing |
