import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

(() => {
  'use strict';
  const STORAGE_KEY = 'malayalam-notes-v1';
  const $ = (id) => document.getElementById(id);
  const titleInput = $('note-title');
  const malayalamInput = $('malayalam-text');
  const englishInput = $('english-text');
  const micButton = $('mic-button');
  const micLabel = $('mic-label');
  const micStatus = $('mic-status');
  const translateButton = $('translate-button');
  const translationStatus = $('translation-status');
  const saveButton = $('save-button');
  const clearButton = $('clear-button');
  const formMessage = $('form-message');
  const searchInput = $('search-notes');
  const notesList = $('notes-list');
  const emptyState = $('empty-state');
  const noteCount = $('note-count');
  const exportButton = $('export-button');
  const importFile = $('import-file');
  const importButton = $('import-button');
  const backupStatus = $('backup-status');

  let notes = readNotes();
  let recognition = null;
  let listening = false;
  let finalTranscript = '';
  let recognitionSupported = false;
  let translationInProgress = false;
  const isNativeApp = Capacitor.isNativePlatform();

  function readNotes() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(isValidNote) : [];
    } catch (_) {
      return [];
    }
  }
  function isValidNote(note) {
    return note && typeof note.id === 'string' && typeof note.malayalam === 'string' && typeof note.english === 'string';
  }
  function persistNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      return true;
    } catch (_) {
      setMessage('Storage is full or unavailable. Export a backup and try removing a large note.', true);
      return false;
    }
  }
  function setMessage(text, isError = false) {
    formMessage.textContent = text;
    formMessage.classList.toggle('error', isError);
  }
  function setBackupMessage(text, isError = false) {
    backupStatus.textContent = text;
    backupStatus.classList.toggle('error', isError);
  }
  function setTranslating(value) {
    translationInProgress = value;
    translateButton.disabled = value;
    saveButton.disabled = value;
    translationStatus.textContent = value ? 'Translating…' : '';
  }
  function setListeningUi(active, statusText = '') {
    listening = active;
    micButton.classList.toggle('is-listening', active);
    micButton.setAttribute('aria-pressed', String(active));
    micLabel.textContent = active
      ? (isNativeApp ? 'Listening… finish in Android window' : 'Listening… tap to stop')
      : 'Speak in Malayalam';
    micButton.disabled = Boolean(active && isNativeApp);
    if (statusText) micStatus.textContent = statusText;
  }

  function appendTranscript(text) {
    const current = malayalamInput.value.trim();
    const captured = String(text || '').trim();
    if (captured) malayalamInput.value = [current, captured].filter(Boolean).join(' ');
  }

  function makeBrowserRecognition() {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return null;
    const instance = new SpeechRecognitionAPI();
    instance.lang = 'ml-IN';
    instance.continuous = true;
    instance.interimResults = true;
    instance.maxAlternatives = 1;
    instance.onstart = () => {
      finalTranscript = malayalamInput.value.trim();
      setListeningUi(true, 'Listening for Malayalam. Speak clearly and tap to stop.');
    };
    instance.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = [finalTranscript, chunk.trim()].filter(Boolean).join(' ');
        } else {
          interim += chunk;
        }
      }
      malayalamInput.value = [finalTranscript, interim.trim()].filter(Boolean).join(' ');
    };
    instance.onerror = (event) => {
      const messages = {
        'not-allowed': 'Microphone permission was blocked. Allow microphone access in settings.',
        'service-not-allowed': 'This browser does not allow speech recognition for this site.',
        'audio-capture': 'No microphone was found. You can type Malayalam into the box instead.',
        'no-speech': 'No speech was heard. Tap the microphone and try again.',
        'network': 'Speech recognition needs an internet connection in this browser.'
      };
      micStatus.textContent = messages[event.error] || ('Speech recognition stopped (' + event.error + '). You can type instead.');
    };
    instance.onend = () => {
      setListeningUi(false);
      const knownError = ['Microphone permission', 'This browser', 'No microphone', 'No speech', 'Speech recognition stopped', 'Speech recognition needs'];
      if (!knownError.some(prefix => micStatus.textContent.startsWith(prefix))) {
        micStatus.textContent = malayalamInput.value.trim()
          ? 'Speech captured. Review the Malayalam words below.'
          : 'Ready when you are.';
      }
    };
    return instance;
  }

  function setupRecognition() {
    if (isNativeApp) {
      recognitionSupported = true;
      micStatus.textContent = 'Ready. Tap the microphone; Android will open its speech window.';
      return;
    }
    recognition = makeBrowserRecognition();
    recognitionSupported = Boolean(recognition);
    if (!recognitionSupported) {
      micButton.disabled = true;
      micButton.title = 'Speech recognition is not available here. You can still type Malayalam below.';
      micStatus.textContent = 'Speech recognition is not available in this browser. You can type Malayalam below.';
      micButton.style.opacity = '0.65';
    }
  }

  async function captureNativeSpeech() {
    if (listening) return;
    setListeningUi(true, 'Checking microphone permission and opening Android speech recognition…');
    try {
      const availability = await SpeechRecognition.available();
      if (!availability.available) throw new Error('Speech recognition is not available on this device.');
      let permission = await SpeechRecognition.checkPermissions();
      if (permission.speechRecognition !== 'granted') {
        permission = await SpeechRecognition.requestPermissions();
      }
      if (permission.speechRecognition !== 'granted') throw new Error('Microphone permission was not granted.');
      micStatus.textContent = 'Speak Malayalam in the Android speech window, then finish there.';
      const result = await SpeechRecognition.start({
        language: 'ml-IN',
        maxResults: 1,
        prompt: 'Speak in Malayalam',
        partialResults: false,
        popup: true
      });
      const transcript = Array.isArray(result.matches) ? result.matches[0] : '';
      if (transcript && transcript.trim()) {
        appendTranscript(transcript);
        micStatus.textContent = 'Speech captured. Review the Malayalam words below before translating.';
      } else {
        micStatus.textContent = 'No words were recognized. Try again, or type Malayalam below.';
      }
    } catch (error) {
      console.error('Malayalam speech recognition failed:', error);
      const reason = error && error.message ? error.message : '';
      micStatus.textContent = reason.toLowerCase().includes('permission')
        ? 'Microphone permission is needed. Allow it in Android Settings, then try again.'
        : 'Could not start Malayalam speech recognition. Check that a speech service is installed and try again, or type Malayalam below.';
    } finally {
      setListeningUi(false);
    }
  }

  micButton.addEventListener('click', () => {
    if (!recognitionSupported) return;
    if (isNativeApp) {
      captureNativeSpeech();
      return;
    }
    if (listening) {
      recognition.stop();
      return;
    }
    try {
      micStatus.textContent = 'Requesting microphone…';
      recognition.start();
    } catch (_) {
      micStatus.textContent = 'The microphone is busy. Wait a moment and tap again.';
    }
  });
  // Free, keyless Google Translate web endpoint for this personal-use prototype.
  // It is not an officially supported public API and may change or stop working.
  async function translateMalayalamToEnglish(text) {
    const pieces = splitText(text, 350);
    const translatedPieces = [];
    for (const piece of pieces) {
      const url = new URL('https://translate.googleapis.com/translate_a/single');
      url.search = new URLSearchParams({ client: 'gtx', sl: 'ml', tl: 'en', dt: 't', q: piece }).toString();
      const response = await fetch(url.toString(), { method: 'GET', mode: 'cors' });
      if (!response.ok) throw new Error('Translation service returned an error.');
      const data = await response.json();
      const translated = Array.isArray(data?.[0]) ? data[0].map(segment => segment?.[0] || '').join('') : '';
      if (!translated.trim()) throw new Error('The service returned an empty translation.');
      translatedPieces.push(translated);
    }
    return translatedPieces.join(' ');
  }
  function splitText(text, maxChars) {
    const sentences = text.match(/[^.!?।]+[.!?।]?/gu) || [text];
    const pieces = [];
    let current = '';
    for (const sentence of sentences) {
      if (sentence.length > maxChars) {
        if (current.trim()) pieces.push(current.trim());
        current = '';
        for (let i = 0; i < sentence.length; i += maxChars) pieces.push(sentence.slice(i, i + maxChars).trim());
      } else if ((current + sentence).length > maxChars) {
        if (current.trim()) pieces.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) pieces.push(current.trim());
    return pieces.filter(Boolean);
  }

  translateButton.addEventListener('click', async () => {
    const source = malayalamInput.value.trim();
    if (!source) {
      translationStatus.textContent = '';
      setMessage('Speak or type a Malayalam note first.', true);
      malayalamInput.focus();
      return;
    }
    if (translationInProgress) return;
    setMessage('');
    setTranslating(true);
    try {
      englishInput.value = await translateMalayalamToEnglish(source);
      translationStatus.textContent = 'Translation ready — please review it.';
    } catch (error) {
      translationStatus.textContent = 'Could not translate automatically.';
      setMessage('Translation did not work. Check your internet connection, then try again. You can also type the English translation and save both languages.', true);
    } finally {
      setTranslating(false);
    }
  });

  saveButton.addEventListener('click', async () => {
    const malayalam = malayalamInput.value.trim();
    if (!malayalam) {
      setMessage('Add a Malayalam note before saving.', true);
      malayalamInput.focus();
      return;
    }
    let english = englishInput.value.trim();
    if (!english && !translationInProgress) {
      setTranslating(true);
      try {
        english = await translateMalayalamToEnglish(malayalam);
        englishInput.value = english;
      } catch (_) {
        setMessage('Automatic translation failed. Type the English translation in its box, then save again.', true);
        englishInput.focus();
        return;
      } finally {
        setTranslating(false);
      }
    }
    english = englishInput.value.trim();
    if (!english) {
      setMessage('Please add an English translation before saving, so both languages are kept together.', true);
      englishInput.focus();
      return;
    }
    const now = new Date().toISOString();
    const note = {
      id: makeId(),
      title: titleInput.value.trim() || deriveTitle(english),
      malayalam,
      english,
      createdAt: now
    };
    notes.unshift(note);
    if (!persistNotes()) {
      notes.shift();
      return;
    }
    renderNotes();
    titleInput.value = '';
    malayalamInput.value = '';
    englishInput.value = '';
    translationStatus.textContent = '';
    setMessage('Saved! Both Malayalam and English are together in your notes.');
    micStatus.textContent = 'Ready when you are.';
    $('notes-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  clearButton.addEventListener('click', () => {
    if (listening && recognition) recognition.stop();
    titleInput.value = '';
    malayalamInput.value = '';
    englishInput.value = '';
    translationStatus.textContent = '';
    setMessage('');
    micStatus.textContent = 'Ready when you are.';
  });

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function deriveTitle(english) {
    const firstLine = english.split(/\r?\n/)[0].trim();
    return firstLine.length > 42 ? `${firstLine.slice(0, 39)}…` : (firstLine || 'My note');
  }
  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Saved note';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }
  function createNoteCard(note) {
    const article = document.createElement('article');
    article.className = 'note-card';
    const top = document.createElement('div');
    top.className = 'note-card-top';
    const info = document.createElement('div');
    info.appendChild(createTextElement('h3', 'note-title', note.title || 'My note'));
    info.appendChild(createTextElement('time', 'note-date', formatDate(note.createdAt)));
    const actions = document.createElement('div');
    actions.className = 'note-actions';
    const editButton = createTextElement('button', 'small-action', 'Edit');
    editButton.type = 'button';
    editButton.addEventListener('click', () => loadNoteForEditing(note.id));
    const deleteButton = createTextElement('button', 'small-action delete', 'Delete');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', () => deleteNote(note.id));
    actions.append(editButton, deleteButton);
    top.append(info, actions);
    article.appendChild(top);
    article.appendChild(makeLanguageSection('Malayalam', note.malayalam, 'ml'));
    article.appendChild(makeLanguageSection('English', note.english, 'en'));
    return article;
  }
  function makeLanguageSection(label, text, langClass) {
    const section = document.createElement('section');
    section.className = `note-language ${langClass}`;
    section.appendChild(createTextElement('h4', '', label));
    const paragraph = createTextElement('p', '', text);
    paragraph.setAttribute('lang', langClass === 'ml' ? 'ml' : 'en');
    section.appendChild(paragraph);
    return section;
  }
  function renderNotes() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const visible = notes.filter(note => [note.title, note.malayalam, note.english].some(value => String(value || '').toLocaleLowerCase().includes(query)));
    notesList.replaceChildren(...visible.map(createNoteCard));
    noteCount.textContent = String(notes.length);
    emptyState.hidden = notes.length > 0;
    if (notes.length > 0 && visible.length === 0) {
      const noResults = createTextElement('p', 'helper', 'No notes match that search. Try another word.');
      noResults.style.textAlign = 'center';
      notesList.appendChild(noResults);
    }
  }
  function loadNoteForEditing(id) {
    const note = notes.find(item => item.id === id);
    if (!note) return;
    titleInput.value = note.title || '';
    malayalamInput.value = note.malayalam;
    englishInput.value = note.english;
    notes = notes.filter(item => item.id !== id);
    persistNotes();
    renderNotes();
    setMessage('This note is ready to edit. Save both languages when finished.');
    $('create-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function deleteNote(id) {
    const note = notes.find(item => item.id === id);
    if (!note || !window.confirm(`Delete “${note.title || 'this note'}”? This cannot be undone unless you have a backup.`)) return;
    const previous = notes;
    notes = notes.filter(item => item.id !== id);
    if (!persistNotes()) notes = previous;
    renderNotes();
  }
  searchInput.addEventListener('input', renderNotes);

  exportButton.addEventListener('click', () => {
    try {
      const blob = new Blob([JSON.stringify({ app: 'Malayalam Notes', version: 1, exportedAt: new Date().toISOString(), notes }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `malayalam-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setBackupMessage('Backup downloaded. Keep it somewhere safe.');
    } catch (_) {
      setBackupMessage('Could not create a backup in this browser.', true);
    }
  });

  importButton.addEventListener('click', async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) {
      setBackupMessage('Choose a backup JSON file first.', true);
      return;
    }
    try {
      const raw = JSON.parse(await file.text());
      const incoming = Array.isArray(raw) ? raw : raw.notes;
      if (!Array.isArray(incoming) || incoming.length > 5000 || !incoming.every(isValidNote)) throw new Error('invalid format');
      const existingIds = new Set(notes.map(note => note.id));
      const cleaned = incoming.map(note => ({
        id: existingIds.has(note.id) ? makeId() : note.id,
        title: String(note.title || 'My note').slice(0, 100),
        malayalam: String(note.malayalam).slice(0, 1500),
        english: String(note.english).slice(0, 2000),
        createdAt: typeof note.createdAt === 'string' ? note.createdAt : new Date().toISOString()
      }));
      notes = [...cleaned, ...notes];
      if (!persistNotes()) throw new Error('storage');
      renderNotes();
      setBackupMessage(`Restored ${cleaned.length} note${cleaned.length === 1 ? '' : 's'}.`);
      importFile.value = '';
    } catch (_) {
      setBackupMessage('That file does not look like a valid Malayalam Notes backup.', true);
    }
  });

  setupRecognition();
  renderNotes();

  if (!isNativeApp && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // The app still works without offline app-shell caching.
      });
    });
  }
})();
