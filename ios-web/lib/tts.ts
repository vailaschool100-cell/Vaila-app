import { PracticeMode } from './content/types';

const FEMALE_VOICE_HINTS = ['female', 'zira', 'samantha', 'karen', 'google us english'];

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve([]);

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    cachedVoices = existing;
    voicesLoaded = true;
    return Promise.resolve(existing);
  }
  if (voicesLoaded) return Promise.resolve(cachedVoices);

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cachedVoices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true });
    // Some engines never fire voiceschanged — don't wait forever.
    setTimeout(finish, 1000);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Always read the romanized text with the same en-US English voice
  // regardless of mode — matching the app exactly, which always calls
  // setLanguage('en-US') for every mode including Urdu (items speak their
  // romanized form, e.g. "Baal", never the raw script).
  //
  // Google's voice is strongly preferred over Windows/SAPI voices (e.g.
  // "Microsoft Zira"): SAPI voices tend to spell out short, unusual-looking
  // words letter-by-letter ("Aal" -> "A A L") instead of pronouncing them,
  // which is exactly the mismatch reported against the app. Android's
  // system TTS (what the app actually uses) is Google's engine, so
  // preferring a Google voice here is also the closest real match, not
  // just a workaround for the spelling-out quirk.
  const isEnUS = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase() === 'en-us';
  const isEn = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().startsWith('en');
  const isGoogle = (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('google');
  const isFemale = (v: SpeechSynthesisVoice) =>
    FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint));

  return (
    voices.find((v) => isEnUS(v) && isGoogle(v)) ||
    voices.find((v) => isEn(v) && isGoogle(v)) ||
    voices.find((v) => isEnUS(v) && isFemale(v)) ||
    voices.find(isEnUS) ||
    voices.find((v) => isEn(v) && isFemale(v)) ||
    voices.find(isEn)
  );
}

export interface SpeakOptions {
  times?: number;
  gapMs?: number;
  rate?: number;
  pitch?: number;
  mode: PracticeMode;
  onEach?: (count: number) => void;
}

let cancelFlag = false;

export function cancelSpeak() {
  cancelFlag = true;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Chrome can leave the speech queue in a stuck state on a fresh page load —
// the very first speak() call in the tab's lifetime sometimes never fires
// onend/onerror at all, freezing whatever UI is awaiting it. Calling
// cancel() once before the first-ever utterance resets the engine and
// reliably avoids this (well-documented speechSynthesis quirk); once any
// mode has successfully spoken, later modes are unaffected — which matches
// the reported symptom of Urdu "fixing itself" after visiting another mode
// first.
let enginePrimed = false;

function speakOnce(text: string, voice: SpeechSynthesisVoice | undefined, rate: number, pitch: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;

    if (!enginePrimed) {
      enginePrimed = true;
      try {
        synth.cancel();
      } catch {
        /* no-op */
      }
    }

    try {
      synth.resume();
    } catch {
      /* no-op */
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    let settled = false;
    const safetyTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve();
    }, 4000); // some browsers/voices silently never fire onend/onerror — without
    // this the UI gets stuck forever on "1 of 3" with no way to recover short
    // of reloading the page.

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;

    synth.speak(utterance);
  });
}

// Must be invoked synchronously from a real click handler (iOS Safari gesture rule).
export async function speakNTimes(text: string, options: SpeakOptions): Promise<void> {
  const { times = 3, gapMs = 600, rate = 0.8, pitch = 1.25, onEach } = options;
  cancelFlag = false;
  const voices = await loadVoices();
  const voice = pickVoice(voices);

  for (let i = 0; i < times; i++) {
    if (cancelFlag) break;
    onEach?.(i + 1);
    await speakOnce(text, voice, rate, pitch);
    if (cancelFlag) break;
    await new Promise((r) => setTimeout(r, gapMs));
  }
}
