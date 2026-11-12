# Production Bug Audit

Audit date: 2026-11-12 (Asia/Kolkata)

## Confirmed Issues

### Android launcher icon

- `AndroidManifest.xml` uses `@mipmap/ic_launcher` as the application icon.
- The project contains only legacy `mipmap-*/ic_launcher.png` resources. No
  `mipmap-anydpi-v26/ic_launcher.xml` adaptive icon resource exists.
- `drawable/ic_launcher_foreground.xml` exists, but nothing references it, so
  Android launchers cannot use it.
- A supplied new logo exists at `mobile/Makeable Jobs Logo with Orbiting M.png`.
- The connected phone has `com.makeable.jobs` version `1.0.0` installed. Its
  installed APK size matches the locally cached release artifact, while the
  current icon resources were changed after that artifact was built.

Root cause: the installed APK predates the current launcher-resource changes and
the Android project has no adaptive icon configuration. Replacing a Flutter
image alone cannot update the launcher because Android reads the manifest's
`@mipmap/ic_launcher` resource.

### Production login connectivity

- The Flutter client hard-codes the Render API URL in
  `mobile/lib/core/network/api_client.dart`.
- The code comment documents `--dart-define=API_BASE_URL`, but the constant does
  not consume that define. Build environment selection therefore has no effect.
- Login and registration map broad connection failures to the same message:
  `Cannot reach the server. Is the API running?`
- The configured production backend URL is live. DNS resolves and
  `GET https://makeable-jobs-api.onrender.com/health` returned HTTP 200 with
  `{"status":"ok","app":"Makeable Jobs API","env":"production"}`.
- The production OpenAPI endpoint returned HTTP 200 and lists
  `POST /api/v1/auth/login`.
- Android has `INTERNET` and `ACCESS_NETWORK_STATE` permissions.
- The connected phone can resolve and reach the configured Render hostname.

Root cause: the reported message is misleading and the app lacks environment
based API configuration. The service itself was healthy when tested; a previous
APK, device-specific TLS/network error, or an invalid request was being
classified as a server outage.

## Verified Integration Facts

- Physical device: Samsung SM-E236B, Android 14, device ID redacted from this
  document.
- API base URL currently configured in source:
  `https://makeable-jobs-api.onrender.com/api/v1`
- Backend health endpoint: `/health`
- Authentication endpoint: `POST /api/v1/auth/login` with JSON body.
- Firebase service-account and Android Firebase configuration both identify the
  `makeable-jobs` Firebase project.
- Backend supports Google Firebase ID-token verification at
  `POST /api/v1/auth/google`; email/password login remains backend JWT based.

## Suspected / Unverified Risks

- Render runtime logs and deployment environment values are not accessible from
  the local repository. Firebase Admin configuration and Supabase connectivity
  on the deployed service cannot be confirmed without deployment access or a
  successful authenticated flow.
- Google sign-in cannot be tested without a real account interaction. It must
  be verified on the physical phone after installation.
- `backend/.env` contains local secrets and must not be committed. It was only
  inspected for variable names, configured state, and value lengths.
- Existing deployment documentation contains an older Railway URL example;
  this conflicts with the verified Render URL and can lead to incorrect builds.

## Files Requiring Changes

- `mobile/pubspec.yaml`: generate Android adaptive and legacy launcher icons.
- `mobile/android/app/src/main/AndroidManifest.xml`: declare the round launcher
  icon alongside the standard icon.
- `mobile/lib/core/network/api_client.dart`: honor a build-time API URL,
  classify failures, and retain debug-safe diagnostics.
- `mobile/lib/features/auth/presentation/login_screen.dart`
- `mobile/lib/features/auth/presentation/register_screen.dart`
- `docs/deployment.md`: replace conflicting mobile API examples with the
  verified production URL and explicit development override instructions.

## Required Tests

- `flutter analyze`
- `flutter test`
- Debug APK built with the production default URL
- Installed APK resource inspection for `mipmap-anydpi-v26/ic_launcher.xml`
- Physical phone verification of launcher, app drawer, and app info icon
- Fresh email/password login with a valid account
- Existing-session login, logout, and login again
- Offline login error and recovery
- Google/Firebase login with a configured real account

## Release Risks

- Do not claim Firebase/Supabase production login is verified until a real
  credentialed device test succeeds.
- Do not publish a release APK until debug installation and device checks pass.
- Android launchers can cache icons. Updating the APK, uninstalling/reinstalling
  only if necessary, and rebooting the launcher are device remediation steps;
  changing the package ID is not.
