import { PracticeItem } from './types';

// 26 English alphabet items, a-z, each with a themed sample word.
export const ALPHABETS: PracticeItem[] = [
  { id: 'a', letter: 'a', sound: 'A', word: 'Apple', speechText: 'A', tip: 'Say Letter A!' },
  { id: 'b', letter: 'b', sound: 'B', word: 'Ball', speechText: 'B', tip: 'Say Letter B!' },
  { id: 'c', letter: 'c', sound: 'C', word: 'Cat', speechText: 'C', tip: 'Say Letter C!' },
  { id: 'd', letter: 'd', sound: 'D', word: 'Dog', speechText: 'D', tip: 'Say Letter D!' },
  { id: 'e', letter: 'e', sound: 'E', word: 'Elephant', speechText: 'E', tip: 'Say Letter E!' },
  { id: 'f', letter: 'f', sound: 'F', word: 'Fish', speechText: 'F', tip: 'Say Letter F!' },
  { id: 'g', letter: 'g', sound: 'G', word: 'Goat', speechText: 'G', tip: 'Say Letter G!' },
  { id: 'h', letter: 'h', sound: 'H', word: 'Hat', speechText: 'H', tip: 'Say Letter H!' },
  { id: 'i', letter: 'i', sound: 'I', word: 'Igloo', speechText: 'I', tip: 'Say Letter I!' },
  { id: 'j', letter: 'j', sound: 'J', word: 'Jug', speechText: 'J', tip: 'Say Letter J!' },
  { id: 'k', letter: 'k', sound: 'K', word: 'Kite', speechText: 'K', tip: 'Say Letter K!' },
  { id: 'l', letter: 'l', sound: 'L', word: 'Lion', speechText: 'L', tip: 'Say Letter L!' },
  { id: 'm', letter: 'm', sound: 'M', word: 'Monkey', speechText: 'M', tip: 'Say Letter M!' },
  { id: 'n', letter: 'n', sound: 'N', word: 'Nest', speechText: 'N', tip: 'Say Letter N!' },
  { id: 'o', letter: 'o', sound: 'O', word: 'Orange', speechText: 'O', tip: 'Say Letter O!' },
  { id: 'p', letter: 'p', sound: 'P', word: 'Parrot', speechText: 'P', tip: 'Say Letter P!' },
  { id: 'q', letter: 'q', sound: 'Q', word: 'Queen', speechText: 'Q', tip: 'Say Letter Q!' },
  { id: 'r', letter: 'r', sound: 'R', word: 'Rabbit', speechText: 'R', tip: 'Say Letter R!' },
  { id: 's', letter: 's', sound: 'S', word: 'Snake', speechText: 'S', tip: 'Say Letter S!' },
  { id: 't', letter: 't', sound: 'T', word: 'Tiger', speechText: 'T', tip: 'Say Letter T!' },
  { id: 'u', letter: 'u', sound: 'U', word: 'Umbrella', speechText: 'U', tip: 'Say Letter U!' },
  { id: 'v', letter: 'v', sound: 'V', word: 'Van', speechText: 'V', tip: 'Say Letter V!' },
  { id: 'w', letter: 'w', sound: 'W', word: 'Whale', speechText: 'W', tip: 'Say Letter W!' },
  { id: 'x', letter: 'x', sound: 'X', word: 'Xylophone', speechText: 'X', tip: 'Say Letter X!' },
  { id: 'y', letter: 'y', sound: 'Y', word: 'Yak', speechText: 'Y', tip: 'Say Letter Y!' },
  { id: 'z', letter: 'z', sound: 'Z', word: 'Zebra', speechText: 'Z', tip: 'Say Letter Z!' },
];

// a -> ah, b -> buh, ... used for the "sounds like X" subtitle in alphabets mode.
export const LETTER_PHONETIC_SOUNDS: Record<string, string> = {
  a: 'ah', b: 'buh', c: 'kuh', d: 'duh', e: 'eh',
  f: 'feh', g: 'guh', h: 'huh', i: 'ih', j: 'juh',
  k: 'kuh', l: 'leh', m: 'muh', n: 'nuh', o: 'oh',
  p: 'puh', q: 'quh', r: 'ruh', s: 'suh', t: 'tuh',
  u: 'uh', v: 'vuh', w: 'wuh', x: 'ks', y: 'yuh', z: 'zuh',
};
