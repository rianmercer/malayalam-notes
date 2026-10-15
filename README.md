# Malayalam Notes

A free Android app idea built for a Malayalam-speaking family member: speak a thought, keep the Malayalam recognition, translate each item into English, and save both together.

## What is included

- A larger tap-to-start / tap-to-finish microphone control designed to keep listening across short pauses.
- Malayalam words and English translations formatted as matching bullet lists.
- Item-by-item translation to keep the list order, rather than translating the whole list as one paragraph.
- A refreshed notebook-inspired UI with forest green, mint, and warm papaya accents.
- Local note storage, search, edit/delete, and backup/restore.

## Download the Android APK

1. Open the [Android APK workflow](https://github.com/rianmercer/malayalam-notes/actions/workflows/build-android-apk.yml).
2. Open the latest successful run named **Build Malayalam Notes Android APK**.
3. Under **Artifacts**, download **malayalam-notes-debug-apk**.
4. Extract the ZIP and install the included app-debug.apk on an Android phone.

The automated build uses free dependencies and GitHub Actions. This is a debug APK for personal testing, not a Play Store release.

## Before relying on it

Speech recognition quality and continuous-listening behaviour depend on the speech service and Malayalam language model available on the phone. Review the recognized Malayalam and English translations, especially item names and quantities. Automatic translation uses an unofficial free web endpoint and may change. Notes are stored locally and do not sync between devices, so use backups.

See the [app README](./Malayalam%20Notes%20App/README.md) for details.
