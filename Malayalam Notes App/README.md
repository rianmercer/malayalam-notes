# Malayalam Notes (free PWA starter)

A small phone-friendly app for speaking Malayalam, reviewing the recognized Malayalam text, translating it into English, and saving both versions together.

## What works in this version

- Large microphone button configured for Malayalam (`ml-IN`) using the browser's Web Speech API.
- Editable Malayalam transcript and editable English translation.
- Saved notes, searchable by title or either language.
- Edit or delete an existing note.
- Download a JSON backup and restore it on the same or another device.
- Installable Progressive Web App (PWA); the app shell can open offline after it has been loaded once.
- Notes are stored in local browser storage on that device. There is no user account or paid database.

## Important limits

1. **Speech recognition depends on the browser and connection.** Try a recent version of Chrome first. Some browsers/devices may not provide Malayalam speech recognition. In Chrome, microphone access must be allowed and the site should use HTTPS (GitHub Pages does).
2. **A transcript is not guaranteed to be word-for-word perfect.** The person should check/correct the Malayalam transcript before translation and saving. Accent, background noise, names, and quantities can affect recognition.
3. **Translation uses a free, keyless Google Translate web endpoint** (`translate.googleapis.com`), not an officially supported public translation API. It may be changed, restricted, or stop working at any time. Translation accuracy also is not guaranteed. If translation fails, the English field can be filled manually and saved.
4. **Internet is required** for browser speech recognition on many devices and for automatic translation. The saved notes and app shell can be viewed offline after the app has loaded, but speech recognition/automatic translation may not work offline.
5. **Privacy:** the saved notes live in this browser on this device. Browser speech recognition may send audio to its provider, and automatic translation sends Malayalam text to Google's translation endpoint. Do not use this prototype for highly sensitive information. Clearing site data can delete notes, so use **Back up** regularly.
6. There is **no automatic sync** between devices in this version. Install/open the hosted app on your mom's phone to save notes there, or export a backup from one device and import it on another.

## Run locally

For microphone support, open it through a local web server rather than directly as a `file://` page. If Python is installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in Chrome. Internet may still be needed for recognition/translation.

## Free deployment using GitHub Pages

1. Create a new **public** GitHub repository, for example `malayalam-notes`.
2. Upload all files from this folder, including the `.github/workflows/pages.yml` file.
3. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
4. Open the **Actions** tab. The workflow will publish the app. Once it succeeds, open the Pages URL shown in the deployment summary.
5. On your mom's Android phone, open that HTTPS URL in Chrome, then use the browser menu → **Add to Home screen** (or **Install app** if shown). Allow microphone permission when prompted.
6. Test the microphone and Malayalam-to-English translation with a few ordinary phrases before depending on it for a shopping trip.

GitHub Pages is free for public repositories, but hosting and third-party translation/speech behavior are subject to their current service terms and limits.

## No credentials needed here

Do not share passwords, private keys, or GitHub access tokens. To get help editing the project later, share a public repo URL or upload the ZIP/file changes.
