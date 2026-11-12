# Makeable Jobs Device Test Report

**Recorded:** 2026-11-12 (Asia/Kolkata)
**Status:** INCOMPLETE - authentication and feature workflows require a valid test account and user-driven interaction.

## Device and Build

| Item | Result |
| --- | --- |
| Physical devices | Samsung SM-E236B and TECNO LJ7 |
| Android version | Samsung: Android 14 (API 34); TECNO: verified ADB-connected physical device |
| USB debugging | Both devices connected and authorized via ADB |
| Package | `com.makeable.jobs` |
| Build tested | Debug APK, version `1.0.0` (version code `1`) |
| APK build | PASS - `flutter build apk --debug` completed successfully |
| Device install | PASS - `adb install -r` completed successfully on both devices |
| First launch | PASS - `MainActivity` was fully drawn on both devices; no Flutter or app-process fatal exception was observed |
| Home layout regression | PASS at launch - both devices were checked for `BOTTOM OVERFLOWED`, `RenderFlex overflowed`, and Flutter rendering exceptions after the responsive carousel fix; none were captured. |

## Launcher Icon

| Check | Result | Evidence |
| --- | --- | --- |
| APK resources | PASS | The package contains `mipmap/ic_launcher`, density-specific foreground resources, and adaptive icon background `#050816`. |
| Home-screen icon | PASS | A physical-device screenshot after installation shows the new Makeable Jobs logo and label. |
| App label | PASS | Packaged manifest label is `Makeable Jobs`. |
| App info / recents icon | NOT RUN | Not inspected independently during this iteration. Adaptive icon packaging is present. |

## Production Connectivity

| Check | Result | Evidence |
| --- | --- | --- |
| Production API URL | PASS | `https://makeable-jobs-api.onrender.com/api/v1` is the release default and can be overridden only with `API_BASE_URL`. |
| Backend health | PASS | `GET https://makeable-jobs-api.onrender.com/health` returned HTTP 200. |
| Phone DNS/network path | PASS | The connected phone resolved and pinged `makeable-jobs-api.onrender.com`. |
| App startup API request | PASS | Device log recorded `POST /api/v1/notifications/device-token` receiving HTTP 401, proving the app reached the API. The request was unauthenticated, as expected before sign-in. |
| Launch crash | PASS | No `FATAL EXCEPTION` or `AndroidRuntime` failure was captured during launch. |

## Per-Device Launch Results

| Device | Installation | Launch result |
| --- | --- | --- |
| Samsung SM-E236B (`RZCW50ZQ61F`) | PASS | `MainActivity` resumed and fully drawn in approximately 3.9 seconds. |
| TECNO LJ7 (`1440231565033432`) | PASS | `MainActivity` resumed and fully drawn in approximately 6.4 seconds. |

## Authentication and Feature Workflows

| Check | Result | Reason |
| --- | --- | --- |
| Fresh email/password login | NOT RUN | Requires a valid dedicated test account; passwords and tokens were not requested or logged. |
| Existing-account login | NOT RUN | Requires authenticated user interaction. |
| Firebase token verification | NOT RUN | Requires an authenticated Google/Firebase test flow. |
| Logout and relogin | NOT RUN | Requires an authenticated session. |
| Offline login error | NOT RUN | Requires interactive login input while the phone network is disabled. |
| Job search, saved jobs, notifications, trending companies, profile | NOT RUN | Require an authenticated test session. |

## Log Evidence

The launch log shows `MainActivity` fully drawn in approximately 4.9 seconds. It also contains an expected HTTP 401 for unauthenticated device-token registration. No raw credentials, Firebase ID tokens, or other secrets were recorded.

## Remaining Work

1. Perform fresh and existing-account login using a dedicated test account directly on the connected phone.
2. Exercise offline/recovery and authenticated feature workflows, collecting redacted log evidence for any failure.
3. Inspect the icon in Android App info and Recents independently.
4. Build a release APK only after the debug authentication and feature checks pass.

