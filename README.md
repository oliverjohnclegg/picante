# Picante

A messy-but-classy adult drinking game for groups of 4–16, driven by a single
host phone and a physics-first penalty economy that makes everyone drink at a
fair pace regardless of what's in their glass.

See [`docs/PRD.md`](./docs/PRD.md) for the canonical product spec.

## Stack

- **Expo SDK 54** (React Native universal: iOS + Android + Web)
- **TypeScript** (strict)
- **Zustand** for state, **Reanimated + Moti** for motion, **react-native-svg** for brand art
- **AsyncStorage** for session / unlocks / settings / age gate
- **expo-iap** for Diablo unlock (StoreKit / Play Billing)
- **expo-av** for SFX
- **expo-haptics** for tactile feedback
- **Sentry** for crash reporting (opt-in via `EXPO_PUBLIC_SENTRY_DSN`)

## Quick start

```bash
npm install
npm start
```

Then press `i` (iOS sim), `a` (Android emulator), or `w` (web).

## Scripts

| Script                  | Purpose                              |
| ----------------------- | ------------------------------------ |
| `npm start`             | Expo dev server                      |
| `npm run ios`           | Dev server + iOS simulator           |
| `npm run android`       | Dev server + Android emulator        |
| `npm run web`           | Dev server + web                     |
| `npm run lint`          | ESLint (expo config)                 |
| `npm run format`        | Prettier write                       |
| `npm run format:check`  | Prettier check (used in CI)          |
| `npm run typecheck`     | `tsc --noEmit`                       |
| `npm test`              | Jest (unit tests only, no RN render) |
| `npm run test:watch`    | Jest watch mode                      |
| `npm run test:coverage` | Jest with coverage                   |

## Repository layout

```
app/                       # expo-router screens
src/
  game/                    # pure game logic (no RN imports, 100% unit-tested)
  content/                 # forfeit packs + loader
  ui/                      # components, SVG, theme, fonts
  platform/                # native bridges (iap, sfx, haptics, telemetry)
  i18n/                    # string catalogues
assets/
  images/                  # icon, splash, favicon
  audio/                   # 4 SFX samples (CC0)
docs/
  PRD.md                   # canonical product spec
```

## Branching

- `main` — public releases
- `dev` — integration branch
- `feature/*`, `bugfix/*` — branch off `dev`, PR back into `dev`

## Building for stores

EAS build profiles are defined in `eas.json`:

```bash
eas build --profile development --platform ios     # dev client (simulator + device)
eas build --profile preview     --platform all     # internal TestFlight / Play internal
eas build --profile production  --platform all     # store submission (auto-increments build)
```

### IAP sandbox testing

`expo-iap` needs a real dev client (not Expo Go). Build with
`eas build --profile development`, then test Diablo purchase with:

- iOS: a Sandbox Tester account configured in App Store Connect
- Android: a tester account added to the Play Console Internal testing track

The product SKU is `com.picante.diablo` (non-consumable, $4.99).

### Crash reporting

Set `EXPO_PUBLIC_SENTRY_DSN` as an EAS secret before production builds.
Without it, Sentry gracefully no-ops.

## Testing discipline

Pure game logic (`src/game/`) is unit-tested in full isolation. UI screens
are smoke-tested via Jest where practical; anything mechanical that affects
the penalty economy must ship with a test.

Run the whole CI gate locally before pushing:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test
```
