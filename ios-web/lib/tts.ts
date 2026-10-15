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

function pickVoice(voices: SpeechSynthesisVoice[], mode: PracticeMode): SpeechSynthesisVoice | undefined {
  if (mode === 'urdu') {
    const urduVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('ur'));
    if (urduVoice) return urduVoice;
  }
  const female = voices.find((v) =>
    FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint))
  );
  return female || voices.find((v) => v.lang?.toLowerCase().startsWith('en'));
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

function speakOnce(text: string, voice: SpeechSynthesisVoice | undefined, rate: number, pitch: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }
    try {
      window.speechSynthesis.resume();
    } catch {
      /* no-op */
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// Must be invoked synchronously from a real click handler (iOS Safari gesture rule).
export async function speakNTimes(text: string, options: SpeakOptions): Promise<void> {
  const { times = 3, gapMs = 600, rate = 0.8, pitch = 1.25, mode, onEach } = options;
  cancelFlag = false;
  const voices = await loadVoices();
  const voice = pickVoice(voices, mode);

  for (let i = 0; i < times; i++) {
    if (cancelFlag) break;
    onEach?.(i + 1);
    await speakOnce(text, voice, rate, pitch);
    if (cancelFlag) break;
    await new Promise((r) => setTimeout(r, gapMs));
  }
}
