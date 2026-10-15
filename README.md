# Malayalam Notes

A free Android app prototype to help a Malayalam-speaking user capture spoken notes, keep the Malayalam transcript, translate it into English, and save both versions on the same phone.

## Download the Android APK

The Android APK is built automatically by GitHub Actions:

1. Open the [APK build workflow](https://github.com/rianmercer/malayalam-notes/actions/workflows/build-android-apk.yml).
2. Open the latest successful **Build Malayalam Notes Android APK** run.
3. In **Artifacts**, download `malayalam-notes-debug-apk`.
4. Extract the ZIP; the file inside is `app-debug.apk`.
5. Transfer the APK to an Android phone, open it, and follow the installation prompts. Android may ask permission to install apps from the file-opening app.

The build uses GitHub Actions and free dependencies; no paid API key is required.

## What the app does

- Uses Android speech recognition with Malayalam (`ml-IN`) requested when the mic button is tapped.
- Lets the user review and correct the Malayalam transcript.
- Translates the transcript to English through a free, keyless Google Translate web endpoint.
- Saves the Malayalam text and English translation together on the device.
- Supports searching, editing, deleting, exporting and restoring notes.

## Important limitations

- This is a **debug APK** for initial personal testing, not a Play Store release.
- Successful compilation does not guarantee that Malayalam recognition is available on every phone. Speech recognition depends on the Android speech service installed on the device; internet access may be needed.
- Translation uses an unofficial web endpoint and can change or stop working.
- Notes remain on the same phone and are not automatically synced to other devices. Back up important notes regularly.
- Review speech transcripts, translations, and quantities before relying on them for shopping.

## Project files

The web UI and app code are in [Malayalam Notes App](./Malayalam%20Notes%20App/). The Android APK build automation is in [build-android-apk.yml](./.github/workflows/build-android-apk.yml).
