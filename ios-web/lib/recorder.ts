const CANDIDATE_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  for (const type of CANDIDATE_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}

export interface RecordingHandle {
  stopEarly: () => void;
  // Resolves with the recorded audio blob once the window ends (duration or early stop).
  result: Promise<{ blob: Blob; mimeType: string; filename: string } | null>;
}

// Must be invoked synchronously from a real click handler (iOS Safari gesture rule).
export async function startRecording(durationMs: number, onTick?: (msLeft: number) => void): Promise<RecordingHandle> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return {
      stopEarly: () => {},
      result: Promise.resolve(null),
    };
  }

  const mimeType = pickSupportedMimeType();
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  let resolveResult: (v: { blob: Blob; mimeType: string; filename: string } | null) => void;
  const result = new Promise<{ blob: Blob; mimeType: string; filename: string } | null>((resolve) => {
    resolveResult = resolve;
  });

  const cleanup = () => {
    stream.getTracks().forEach((t) => t.stop());
  };

  recorder.onstop = () => {
    cleanup();
    const finalType = mimeType || 'audio/webm';
    const blob = new Blob(chunks, { type: finalType });
    const ext = finalType.includes('mp4') ? 'm4a' : 'webm';
    resolveResult({ blob, mimeType: finalType, filename: `pronunciation.${ext}` });
  };

  recorder.start();

  let elapsed = 0;
  const tickMs = 1000;
  const interval = setInterval(() => {
    elapsed += tickMs;
    const left = Math.max(0, durationMs - elapsed);
    onTick?.(left);
    if (elapsed >= durationMs) {
      clearInterval(interval);
      if (recorder.state !== 'inactive') recorder.stop();
    }
  }, tickMs);

  const stopEarly = () => {
    clearInterval(interval);
    if (recorder.state !== 'inactive') recorder.stop();
  };

  return { stopEarly, result };
}
