/**
 * Audio Recorder Banner — script.js
 *
 * Flow:
 *   1. Feature-detect MediaRecorder + getUserMedia; show fallback if absent.
 *   2. "Start Recording" click → getUserMedia → new MediaRecorder → start().
 *   3. ondataavailable → accumulate Blob chunks in a local array.
 *   4. "Stop Recording" click → mediaRecorder.stop() → onstop fires.
 *   5. onstop → assemble Blob → URL.createObjectURL → wire <audio> src.
 *   6. Release the mic stream tracks immediately after stopping.
 *
 * iframe note:
 *   The embedding page must set allow="microphone" on the <iframe> element
 *   for getUserMedia to function in cross-origin contexts, e.g.:
 *     <iframe src="index.html" width="600" height="500" allow="microphone">
 *
 * Upload note:
 *   Look for the "── UPLOAD HOOK ──" comment to find where to add a
 *   fetch() call to POST the Blob to a server endpoint.
 */

/* Wrap everything in an IIFE to avoid polluting the global scope. */
(function () {
  'use strict';

  // ── DOM references ────────────────────────────────────────────────
  const startBtn        = document.getElementById('startBtn');
  const stopBtn         = document.getElementById('stopBtn');
  const audioPlayer     = document.getElementById('audioPlayer');
  const statusDot       = document.getElementById('statusDot');
  const statusText      = document.getElementById('statusText');
  const messageEl       = document.getElementById('message');
  const playbackSection = document.getElementById('playbackSection');
  const fallbackEl      = document.getElementById('fallback');
  const controlsEl      = document.getElementById('controls');

  // ── Module-scoped state (no global variables) ─────────────────────
  let mediaRecorder  = null; // Active MediaRecorder instance
  let audioChunks    = [];   // Blob chunks collected during recording
  let currentBlobUrl = null; // Object URL of the last recording (for revocation)
  let activeStream   = null; // MediaStream so we can stop tracks after recording

  // ── Feature detection ─────────────────────────────────────────────
  // Check for both MediaRecorder and the modern getUserMedia API.
  // Optional chaining guards against browsers that lack mediaDevices entirely.
  if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    showFallback();
    return; // Nothing more to do in unsupported browsers
  }

  // Hide playback until the first recording is available
  playbackSection.hidden = true;

  // ── Event listeners ───────────────────────────────────────────────
  startBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click',  stopRecording);

  // ── Core functions ────────────────────────────────────────────────

  /**
   * Request microphone access and begin a new recording session.
   * Disables the Start button and enables the Stop button while active.
   */
  async function startRecording() {
    clearMessage();
    audioChunks = [];

    // ── Step 1: Request microphone permission ────────────────────────
    // getUserMedia returns a Promise; it rejects if the user denies access
    // or no microphone is found. We catch specific DOMException names to
    // give the user actionable feedback.
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      handlePermissionError(err);
      return;
    }

    // ── Step 2: Determine a supported MIME type ───────────────────────
    // Browsers differ: Chrome prefers audio/webm, Firefox prefers audio/ogg.
    const mimeType     = getSupportedMimeType();
    const recorderOpts = mimeType ? { mimeType } : {};

    // ── Step 3: Create the MediaRecorder ─────────────────────────────
    mediaRecorder = new MediaRecorder(activeStream, recorderOpts);

    // ── Step 4: Collect audio data as it arrives ──────────────────────
    // Without a timeslice argument to start(), ondataavailable fires once
    // when stop() is called, delivering the entire recording as one chunk.
    // Passing a timeslice (ms) makes it fire periodically — useful for
    // streaming uploads via the UPLOAD HOOK below.
    mediaRecorder.ondataavailable = function (event) {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // ── Step 5: Handle recording completion ───────────────────────────
    mediaRecorder.onstop = function () {
      // Always release mic tracks so the browser stops the recording
      // indicator and other pages can access the microphone again.
      stopStreamTracks();

      if (audioChunks.length === 0) {
        showMessage('No audio was captured. Please try again.');
        resetUI();
        return;
      }

      // Assemble all chunks into a single Blob.
      const blobType  = mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type: blobType });

      // Revoke the previous object URL to avoid memory leaks before
      // creating a new one.
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }

      // Create an in-memory URL for immediate playback (no server needed).
      currentBlobUrl   = URL.createObjectURL(audioBlob);
      audioPlayer.src  = currentBlobUrl;
      playbackSection.hidden = false;

      // ── UPLOAD HOOK ─────────────────────────────────────────────────
      // Uncomment and adapt the block below to POST the recording to a
      // server after each stop. The Blob is ready to use at this point.
      //
      // const formData = new FormData();
      // formData.append('audio', audioBlob, 'recording' + getExtension(blobType));
      //
      // fetch('/api/recordings', { method: 'POST', body: formData })
      //   .then(function (response) {
      //     if (!response.ok) throw new Error('Server error ' + response.status);
      //     return response.json();
      //   })
      //   .then(function (data) { console.log('Upload successful:', data); })
      //   .catch(function (err) { console.error('Upload failed:', err); });
      // ────────────────────────────────────────────────────────────────

      resetUI();
    };

    // Handle unexpected recorder errors
    mediaRecorder.onerror = function (event) {
      const detail = (event.error && event.error.message) ? event.error.message : 'unknown error';
      showMessage('Recording error: ' + detail);
      stopStreamTracks();
      resetUI();
    };

    // ── Step 6: Begin recording ───────────────────────────────────────
    mediaRecorder.start();
    setRecordingUI(true);
  }

  /**
   * Stop the active MediaRecorder.
   * The `onstop` handler fires asynchronously and finishes the job.
   */
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop(); // triggers onstop when all data is flushed
    }
    // Reflect "processing" state while onstop runs
    stopBtn.disabled = true;
    statusDot.classList.remove('status__dot--recording');
    statusText.textContent = 'Processing\u2026'; // "Processing…"
  }

  // ── Helper functions ──────────────────────────────────────────────

  /**
   * Return the first MIME type that MediaRecorder can encode, or an
   * empty string to let the browser choose its default.
   *
   * Ordering: prefer Opus (better quality/size) then fall back to
   * container-only types, then MP4 for Safari.
   *
   * @returns {string}
   */
  function getSupportedMimeType() {
    var candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (MediaRecorder.isTypeSupported(candidates[i])) {
        return candidates[i];
      }
    }
    return '';
  }

  /**
   * Map known DOMException names from getUserMedia to user-friendly text.
   * Falls back to the raw message for any unrecognised error.
   *
   * @param {DOMException} err
   */
  function handlePermissionError(err) {
    var messages = {
      NotAllowedError:      'Microphone access was denied. Please allow it in your browser settings and try again.',
      PermissionDeniedError:'Microphone access was denied.',
      NotFoundError:        'No microphone detected. Please connect a microphone and try again.',
      NotReadableError:     'Your microphone is being used by another application. Please close it and try again.',
    };
    var text = messages[err.name] || ('Could not access microphone: ' + err.message);
    showMessage(text);
    resetUI();
  }

  /**
   * Switch button states and the status indicator between
   * idle (false) and recording (true).
   *
   * @param {boolean} isRecording
   */
  function setRecordingUI(isRecording) {
    startBtn.disabled = isRecording;
    stopBtn.disabled  = !isRecording;
    if (isRecording) {
      statusDot.classList.add('status__dot--recording');
      statusText.textContent = 'Recording\u2026'; // "Recording…"
    } else {
      statusDot.classList.remove('status__dot--recording');
      statusText.textContent = 'Ready';
    }
  }

  /** Reset buttons and status indicator to the idle state. */
  function resetUI() {
    setRecordingUI(false);
  }

  /** Stop every track in the active stream to release the microphone. */
  function stopStreamTracks() {
    if (activeStream) {
      activeStream.getTracks().forEach(function (track) { track.stop(); });
      activeStream = null;
    }
  }

  /**
   * Display a message to the user (error or info).
   * @param {string} text
   */
  function showMessage(text) {
    messageEl.textContent = text;
  }

  /** Clear any displayed message. */
  function clearMessage() {
    messageEl.textContent = '';
  }

  /**
   * Show the static fallback UI and hide all recording controls.
   * Called when the browser lacks MediaRecorder or getUserMedia.
   */
  function showFallback() {
    fallbackEl.hidden = false;
    controlsEl.hidden = true;
  }

  // ── Utility (used by UPLOAD HOOK) ─────────────────────────────────

  /**
   * Return a file extension string for a given MIME type.
   * Useful when constructing the filename for a FormData upload.
   *
   * @param {string} mimeType  e.g. "audio/webm;codecs=opus"
   * @returns {string}         e.g. ".webm"
   */
  function getExtension(mimeType) { // eslint-disable-line no-unused-vars
    if (mimeType.indexOf('ogg')  !== -1) return '.ogg';
    if (mimeType.indexOf('mp4')  !== -1) return '.mp4';
    return '.webm'; // default
  }

}());
