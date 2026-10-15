import { PracticeItem, PracticeMode } from './types';
import { ALPHABETS, LETTER_PHONETIC_SOUNDS } from './alphabets';
import { NUMBERS } from './numbers';
import { URDU } from './urdu';

export { ALPHABETS, LETTER_PHONETIC_SOUNDS, NUMBERS, URDU };
export type { PracticeItem, PracticeMode };

export function getItemsForMode(mode: PracticeMode): PracticeItem[] {
  if (mode === 'numbers') return NUMBERS;
  if (mode === 'urdu') return URDU;
  return ALPHABETS;
}

export function modeLabel(mode: PracticeMode): string {
  if (mode === 'numbers') return 'Numbers';
  if (mode === 'urdu') return 'Urdu';
  return 'Phonics';
}

// Ported verbatim from vaila_home_screen.dart's _speakPhoneticSound3Times:
// - numbers/urdu modes speak item.sound only (Urdu never speaks the raw script)
// - alphabets mode speaks "${LETTER} for ${phonic} ${word}" e.g. "A for ah Apple"
export function getSpeechText(item: PracticeItem, mode: PracticeMode): string {
  if (mode === 'numbers' || mode === 'urdu') return item.sound;
  const letter = item.letter.toLowerCase();
  const phonic = LETTER_PHONETIC_SOUNDS[letter] || letter;
  return `${letter.toUpperCase()} for ${phonic} ${item.word}`;
}

// First 4 items of each list, used by the anonymous /demo trial screen.
export function getDemoItems(): { mode: PracticeMode; items: PracticeItem[] }[] {
  return [
    { mode: 'alphabets', items: ALPHABETS.slice(0, 4) },
    { mode: 'numbers', items: NUMBERS.slice(0, 4) },
    { mode: 'urdu', items: URDU.slice(0, 4) },
  ];
}
