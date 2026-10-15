import { API_URL } from './client';

export interface EvaluationResult {
  target_alphabet: string;
  phonetic_sound: string;
  whisper_transcription: string;
  spoken_ipa: string;
  target_ipa: string;
  accuracy: number;
  passed: boolean;
  threshold: number;
  feedback: string;
}

export async function evaluateAudio(
  blob: Blob,
  filename: string,
  targetAlphabet: string,
  studentId: string,
  options?: { isDemo?: boolean; source?: 'app' | 'web' }
): Promise<EvaluationResult | null> {
  const form = new FormData();
  form.append('file', blob, filename);
  form.append('target_alphabet', targetAlphabet);
  form.append('spoken_text', '');
  form.append('student_id', studentId);
  form.append('is_demo', options?.isDemo ? 'true' : 'false');
  form.append('source', options?.source || 'web');

  try {
    const res = await fetch(`${API_URL}/api/evaluate-audio`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return null;
    return (await res.json()) as EvaluationResult;
  } catch {
    return null;
  }
}
