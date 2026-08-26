# Lunara — Mobile App (React Native)

This is the full React Native / Expo build for **Member 1's** part of the Lunara
project: every screen the user sees and interacts with, wired up to call the
backend APIs that Member 3 (Node/Express) and Member 2 (AI/ML via FastAPI,
proxied through the Node backend) are building.

## What's included

- **Auth flow**: Login, Register, Health Profile onboarding (age, height,
  weight, cycle length, PCOS family history, symptoms checklist)
- **Dashboard**: cycle-day snapshot, quick actions, PCOS risk badge, today's
  insight, recommendation preview
- **Daily check-in**: sleep, water, food/cravings, activity, energy, stress,
  physical symptoms
- **Cycle calendar**: month view with period days highlighted, log-period form
- **Symptom tracking**: categorized symptom chips + history
- **Emotion input**: text, voice recording (expo-av), facial capture
  (expo-camera), and a manual self-report — all feed the Emotion AI fusion
  endpoint
- **PCOS risk result**: risk score/level + SHAP-style contributing-factor bars
- **AI insights**: recurring pattern cards, personal baseline comparison,
  persistent-change alerts, 7-day emotion trend
- **Recommendations**: personalized suggestions + share-report-with-doctor
- **Progress/analytics**: sleep and stress/energy line charts, cycle length
  history
- **Profile**: account + health profile summary, sign out

Signature visual: a **moon-phase illustration** (`src/components/MoonPhase.js`)
used everywhere a "progress" or "cycle position" needs representing — instead
of a generic circular progress ring — since the whole product is about moon
cycles.

## Project structure

```
LunaraApp/
  App.js                  entry point, font loading
  src/
    theme/theme.js         design tokens (color, type, spacing)
    components/            MoonPhase, Card/Button/Chip, Input/ScaleSelector
    navigation/             Auth stack, tab navigator, root switcher
    context/AuthContext.js session state, token persistence
    api/                    one file per backend resource (axios)
    screens/
      Auth/                 Login, Register, HealthProfile
      Home/                 Dashboard
      DailyCheckIn/
      Cycle/                Calendar + LogPeriod
      Symptoms/
      Emotion/
      AI/                   PCOSRiskResult, AIInsights, Recommendations
      Progress/
      Profile/
```

## Setup

1. Install [Node.js 18+](https://nodejs.org) and the Expo CLI is included via
   `npx`, so no global install is required.
2. From this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code with **Expo Go** (iOS/Android) or press `i` / `a` for a
   simulator.

## Connecting to the backend

All network calls go through `src/api/client.js`, which points at:

```js
export const BASE_URL = 'http://localhost:5000/api';
```

Change this to Member 3's actual server URL (and use your machine's LAN IP,
not `localhost`, if testing on a physical device). Every endpoint the app
calls is documented with its expected payload/response shape as a comment in
the matching `src/api/*.js` file — hand those to Member 3 as the API contract.

## Notes for the team

- Camera/microphone permissions are requested only when the user opens the
  Emotion check-in screen, and only used for that session.
- Screens render sensible empty states (e.g. "no screening yet") so the UI is
  demoable before every backend endpoint exists — swap in real data as
  Member 2/3's endpoints come online, no UI changes needed.
- The PCOS result and pattern-detection language is deliberately framed as
  screening/wellness insight, not diagnosis, to match the project's intent.
