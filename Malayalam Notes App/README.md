# Malayalam Notes — voice-first Android app

This app captures spoken Malayalam thoughts, keeps the recognized Malayalam wording, translates each list item into English, and saves both languages together.

## What changed

- The microphone is now a tap-to-start / tap-to-finish control. Android uses inline native recognition instead of a short-lived system popup.
- The recognizer is configured to tolerate a longer pause before splitting speech into segments, then restart across segments while the button remains active.
- Recognized segments, commas, and line breaks become bullet items. Each Malayalam item is translated separately so the English list remains in the same order.
- The app has a warmer notebook-inspired look using forest green, mint, and papaya accents. The current app icon stays as the clean Malayalam-letter mark; a new logo is optional, not required.

## Current limitations

- Continuous recognition uses the Capgo speech-recognition plugin's Capacitor 7 line. It depends on the Android speech service installed on the device, and the actual pause handling and Malayalam accuracy must be tested on the target phone.
- Speech recognition and translation may need internet. The free, keyless Google Translate web endpoint is unofficial and can change or stop working.
- Speech recognition can mishear names, quantities, or accents. Review the Malayalam transcript before translating and saving.
- Notes stay on the phone and are not automatically synchronized between devices. Export backups regularly.

## Build and install the APK

Every push to main runs the [Android APK workflow](../.github/workflows/build-android-apk.yml). Open the latest successful run in the repository's Actions tab and download the malayalam-notes-debug-apk artifact. Extract the ZIP to get app-debug.apk, transfer it to an Android phone, and install it.

The APK is a debug build for personal testing, not a signed Play Store release. No paid API key is required.

## Build locally

From this directory, install dependencies with npm install and create the web bundle with npm run build. Then sync the native project using npx cap sync android. Android Studio / Android SDK tools are needed for a local APK build.
