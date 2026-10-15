export interface PracticeItem {
  id: string;
  letter: string;
  sound: string;
  word: string;
  speechText: string;
  tip: string;
}

export type PracticeMode = 'alphabets' | 'numbers' | 'urdu';
