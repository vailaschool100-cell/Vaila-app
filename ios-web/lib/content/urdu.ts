import { PracticeItem } from './types';

function item(urdu: string, roman: string): PracticeItem {
  return { id: urdu, letter: urdu, sound: roman, word: urdu, speechText: urdu, tip: `Say ${roman}!` };
}

// 79 Urdu word-family items across 5 rhyme series, ported verbatim from the
// Flutter app's _urduAlphabets list (frontend/lib/screens/vaila_home_screen.dart).
// حال (Haal) and حام (Haam) each intentionally appear twice (source data).
export const URDU: PracticeItem[] = [
  // Series 1: the "-aal" rhyme series (30 words)
  item('ال', 'Al'), item('آل', 'Aal'), item('بال', 'Baal'), item('پال', 'Paal'), item('تال', 'Taal'),
  item('ٹال', 'Ṭaal'), item('ثال', 'Saal'), item('جال', 'Jaal'), item('چال', 'Chaal'), item('حال', 'Haal'),
  item('خال', 'Khaal'), item('دال', 'Daal'), item('ڈال', 'Ḍaal'), item('ذال', 'Zaal'), item('رال', 'Raal'),
  item('ڑال', 'Ṛaal'), item('زال', 'Zaal'), item('سال', 'Saal'), item('شال', 'Shaal'), item('غال', 'Ghaal'),
  item('فال', 'Faal'), item('قال', 'Qaal'), item('کال', 'Kaal'), item('گال', 'Gaal'), item('لال', 'Laal'),
  item('مال', 'Maal'), item('نال', 'Naal'), item('وال', 'Waal'), item('حال', 'Haal'), item('یال', 'Yaal'),
  // Series 2: the "-aam" rhyme series (20 words)
  item('آم', 'Aam'), item('بام', 'Baam'), item('پام', 'Paam'), item('تام', 'Taam'), item('جام', 'Jaam'),
  item('چام', 'Chaam'), item('حام', 'Haam'), item('خام', 'Khaam'), item('دام', 'Daam'), item('رام', 'Raam'),
  item('سام', 'Saam'), item('شام', 'Shaam'), item('عام', 'Aam'), item('فام', 'Faam'), item('کام', 'Kaam'),
  item('گام', 'Gaam'), item('لام', 'Laam'), item('نام', 'Naam'), item('وام', 'Waam'), item('حام', 'Haam'),
  // Series 3: the "-aan" rhyme series (17 words)
  item('ان', 'An'), item('آن', 'Aan'), item('بان', 'Baan'), item('پان', 'Paan'), item('تان', 'Taan'),
  item('جان', 'Jaan'), item('حان', 'Haan'), item('خان', 'Khaan'), item('دان', 'Daan'), item('ڈان', 'Ḍaan'),
  item('ران', 'Raan'), item('سان', 'Saan'), item('شان', 'Shaan'), item('فان', 'Faan'), item('کان', 'Kaan'),
  item('لان', 'Laan'), item('مان', 'Maan'),
  // Series 4: the "ab/ap" family (4 words)
  item('اب', 'Ab'), item('آب', 'Aab'), item('اپ', 'Ap'), item('آپ', 'Aap'),
  // Series 5: the "ak/aag" family (8 words)
  item('اک', 'Ak'), item('آگ', 'Aag'), item('باگ', 'Baag'), item('جاگ', 'Jaag'),
  item('راگ', 'Raag'), item('ساگ', 'Saag'), item('لاگ', 'Laag'), item('ناگ', 'Naag'),
];
