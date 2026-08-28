# Divine Healing — Flutter Scaffold

Files prepared before `flutter create` runs. After the project is created, this folder's contents are overlaid onto the new project.

## File map

```
flutter_app_scaffold/
├── README.md                       ← this document
├── FOLDER_STRUCTURE.md             ← final project structure (feature-first)
├── pubspec.yaml                    ← 23 dependencies + splash/icon generator config
├── theme.dart                      ← brand colours / typography / component styles
├── lib/
│   ├── main.dart                   ← entry point (Riverpod + MaterialApp.router)
│   ├── theme.dart                  ← same as above
│   ├── router.dart                 ← GoRouter with 15 routes (matches Glide URLs)
│   ├── models/                     ← Freezed data models
│   │   ├── content_session.dart
│   │   ├── chakra.dart
│   │   ├── breathing_technique.dart
│   │   └── subscriber.dart
│   ├── repositories/
│   │   └── static_content_repository.dart   ← loads JSON assets
│   └── features/
│       ├── splash/splash_screen.dart
│       ├── shell/main_shell.dart            ← 3-tab bottom nav
│       ├── home/home_screen.dart            ← full recreation of the Glide landing
│       ├── library/library_screen.dart
│       ├── profile/profile_screen.dart      ← subscription card ($19 / $149)
│       └── _placeholders.dart               ← stubs for the remaining 9 screens
└── assets/
    └── content/                    ← static content JSON extracted from Glide
        ├── affirmations.json
        ├── chakras.json
        ├── techniques.json
        ├── shadow_work_prompts.json
        ├── manifestation_form.json
        ├── spiritual_awakening.json
        └── category_meta.json
```

## Integration (automated script)

Once the Flutter SDK is installed:

```powershell
powershell -File e:\Tasks\Glide_app\automation\09_setup_flutter_project.ps1
```

The script:
1. Unzips Flutter into `C:\src\flutter`
2. Adds `C:\src\flutter\bin` to the user PATH
3. Runs `flutter doctor` (warns if Android SDK is missing, but the web preview works fine for M1)
4. Runs `flutter create --org com.strawberryhope --project-name divine_healing divine_healing`
5. Overlays the files from this scaffold onto the new project
6. Runs `flutter pub get`
7. Runs `flutter pub run build_runner build` (Freezed / Riverpod codegen)

When it finishes:
```powershell
cd e:\Tasks\Glide_app\divine_healing
flutter run -d chrome   # browser preview (no Android SDK needed)
```

## Integration (manual, when not using the script)

1. Check `flutter --version` (install verified)
2. `cd e:\Tasks\Glide_app`
3. `flutter create --org com.strawberryhope --project-name divine_healing divine_healing`
4. Replace `divine_healing/pubspec.yaml` with this folder's pubspec.yaml
5. Replace `divine_healing/lib/*` with this folder's `lib/*` (including main.dart)
6. Create `divine_healing/assets/content/` and copy this folder's `assets/content/*.json` into it
7. `cd divine_healing`
8. `flutter pub get`
9. `flutter pub run build_runner build --delete-conflicting-outputs`
   - Freezed emits `.freezed.dart` and `.g.dart` files
10. `flutter run -d chrome`

## Route map (Glide URLs preserved)

| Flutter | Glide original |
|---|---|
| `/` | `/` |
| `/library` | `/library` |
| `/library/:category` | `/library/meditation`, `/library/shadow_work`, `/library/reiki` |
| `/content/:id` | `/content/15` etc. |
| `/profile` | `/profile` |
| `/chakras` | `/chakras` (note: Chakra Healing has its own dedicated URL) |
| `/affirmations` | `/affirmations` |
| `/breathing` | `/breathing` |
| `/manifestation` | `/manifestation` |
| `/spiritual-awakening` | `/spiritual-awakening` |
| `/shadow-work/:id` | (not in Glide — new flow) |
| `/booking` | `/booking` |
| `/sign-in` | (Glide handles this on the Home screen) |

## M1 screen status

| Screen | Status | File |
|---|---|---|
| Splash | Done (placeholder icon) | `features/splash/splash_screen.dart` |
| Main Shell (bottom nav) | Done | `features/shell/main_shell.dart` |
| Home | Done (100% Glide recreation) | `features/home/home_screen.dart` |
| Library | Scaffolded (filters only) | `features/library/library_screen.dart` |
| Profile | Done (subscription card) | `features/profile/profile_screen.dart` |
| Sign In | UI stub (auth not wired) | `features/_placeholders.dart` |
| Content Detail | Stub (player is M2) | `features/_placeholders.dart` |
| Chakras / Affirmations / Breathing / Manifestation / SpiritualAwakening / ShadowWork / Booking | Stubs | `features/_placeholders.dart` |

**M1 deliverables (screenshots for the client)**: Splash, Home, Library shell, Profile — all done. After swapping assets (logo, confirmed hex codes), they are ready to send.

## Pre-wiring for M2

- pubspec already includes audio (`just_audio`, `audio_service`), payments (`purchases_flutter`), Supabase (`supabase_flutter`), and social login dependencies
- Freezed models already match the API response shape
- Repository pattern is in place so wiring Supabase in M2 will not require touching widget code
