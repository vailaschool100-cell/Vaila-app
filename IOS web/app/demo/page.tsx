'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Headphones, Mic, CheckCircle2, XCircle, UserPlus } from 'lucide-react';
import { getDemoItems, getSpeechText, PracticeMode, PracticeItem } from '@/lib/content';
import { speakNTimes, cancelSpeak } from '@/lib/tts';
import { startRecording, RecordingHandle } from '@/lib/recorder';
import { evaluateAudio, EvaluationResult } from '@/lib/api/evaluate';

type Phase = 'idle' | 'speaking' | 'readyToSpeak' | 'listening' | 'evaluating' | 'result';

const CATEGORY_LABEL: Record<PracticeMode, string> = {
  alphabets: 'Phonics A-Z',
  numbers: 'Numbers',
  urdu: 'اردو',
};

export default function DemoPage() {
  const router = useRouter();
  const flat: { mode: PracticeMode; item: PracticeItem }[] = getDemoItems().flatMap((g) =>
    g.items.map((item) => ({ mode: g.mode, item }))
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [speechCount, setSpeechCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [nudge, setNudge] = useState('');

  const recordingRef = useRef<RecordingHandle | null>(null);
  const current = flat[index];

  const handleListen = async () => {
    if (phase === 'speaking' || phase === 'listening' || phase === 'evaluating') return;
    setEvalResult(null);
    setPhase('speaking');
    setSpeechCount(0);
    await speakNTimes(getSpeechText(current.item, current.mode), { mode: current.mode, onEach: setSpeechCount });
    setPhase('readyToSpeak');
  };

  const handleSpeak = async () => {
    if (phase !== 'readyToSpeak') return;
    setPhase('listening');
    setTimeLeft(5);
    const handle = await startRecording(5000, (msLeft) => setTimeLeft(Math.ceil(msLeft / 1000)));
    recordingRef.current = handle;
    const recorded = await handle.result;
    setPhase('evaluating');

    if (!recorded) {
      setEvalResult({
        target_alphabet: current.item.letter.toUpperCase(), phonetic_sound: current.item.sound,
        whisper_transcription: '', spoken_ipa: '', target_ipa: '', accuracy: 0, passed: false,
        threshold: 50, feedback: 'Could not access your microphone. Please allow microphone access and try again.',
      });
      setPhase('result');
      return;
    }

    const result = await evaluateAudio(recorded.blob, recorded.filename, current.item.letter, 'Demo', {
      isDemo: true,
      source: 'web',
    });
    setEvalResult(
      result || {
        target_alphabet: current.item.letter.toUpperCase(), phonetic_sound: current.item.sound,
        whisper_transcription: '', spoken_ipa: '', target_ipa: '', accuracy: 0, passed: false,
        threshold: 50, feedback: 'Unable to connect to server. Please try again.',
      }
    );
    setPhase('result');
  };

  const handleNext = () => {
    cancelSpeak();
    setIndex((i) => Math.min(i + 1, flat.length - 1));
    setEvalResult(null);
    setPhase('idle');
  };

  const isLast = index === flat.length - 1;

  return (
    <main className="page-cream" style={{ padding: '20px 16px 60px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 440, margin: '0 auto' }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--navy)', margin: 0 }}>Try the Demo</h1>
        <button
          onClick={() => router.push('/')}
          style={{ background: '#fff', border: 'none', borderRadius: 16, padding: '6px 12px', cursor: 'pointer', color: 'var(--red)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <X size={12} /> Exit
        </button>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
        Word {index + 1} of {flat.length} · {CATEGORY_LABEL[current.mode]}
      </p>

      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 10, maxWidth: 440, marginInline: 'auto' }}>
        {flat.map((_, i) => (
          <div
            key={i}
            style={{
              height: 5, flex: 1, borderRadius: 3,
              background: i <= index ? 'var(--navy)' : '#e5e7eb',
            }}
          />
        ))}
      </div>

      {phase === 'speaking' && (
        <div style={{ textAlign: 'center', marginTop: 16, color: '#7c5cfc', fontWeight: 600 }}>
          🔊 &quot;{current.item.word}&quot; — {speechCount} of 3...
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{ fontSize: current.mode === 'numbers' ? 64 : 90, fontWeight: 900, color: 'var(--navy)', lineHeight: 1.1 }}>
          {current.mode === 'numbers' ? current.item.letter : current.item.letter.toUpperCase()}
        </div>
        <p style={{ color: '#9ca3af', fontSize: 15, fontWeight: 500, marginTop: 4 }}>{current.item.word}</p>
      </div>

      {nudge && (
        <p style={{ textAlign: 'center', color: '#7c5cfc', fontSize: 13, fontWeight: 600, marginTop: 8 }}>{nudge}</p>
      )}

      <div style={{ maxWidth: 420, margin: '20px auto 0' }}>
        {phase === 'evaluating' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <span className="spinner-dark" style={{ borderTopColor: '#7c5cfc', borderColor: 'rgba(124,92,252,0.2)' }} />
            <p style={{ fontWeight: 700, marginTop: 12 }}>Evaluating Speech...</p>
          </div>
        )}

        {phase === 'result' && evalResult && (
          <div className="card" style={{ border: `2px solid ${evalResult.passed ? 'var(--green-accent)' : '#f43f5e'}`, textAlign: 'center' }}>
            {evalResult.passed ? <CheckCircle2 size={32} color="#10b981" /> : <XCircle size={32} color="#f43f5e" />}
            <h2 style={{ margin: '8px 0 0', fontSize: 18, color: evalResult.passed ? '#10b981' : '#f43f5e' }}>
              {evalResult.passed ? 'GREAT JOB!' : 'TRY AGAIN!'}
            </h2>
            <p style={{ fontWeight: 700, marginTop: 4 }}>Match Score: {evalResult.accuracy}%</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{evalResult.feedback}</p>
            {evalResult.passed && !isLast && (
              <button onClick={handleNext} className="btn-primary" style={{ marginTop: 12, background: 'var(--green-accent)' }}>
                Next Word →
              </button>
            )}
            {evalResult.passed && isLast && (
              <button onClick={() => router.push('/signup')} className="btn-primary" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <UserPlus size={18} /> Sign Up for Full Access
              </button>
            )}
            {!evalResult.passed && (
              <button onClick={handleListen} className="btn-primary" style={{ marginTop: 12, background: '#7c5cfc' }}>
                Try Again 🔄
              </button>
            )}
          </div>
        )}

        {phase === 'listening' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700 }}>Listening... say &quot;{current.item.word}&quot;</p>
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--navy)', borderRadius: 4, width: `${(timeLeft / 12) * 100}%`, transition: 'width 1s linear' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{timeLeft}s remaining</p>
            <div
              onClick={() => recordingRef.current?.stopEarly()}
              className="pulse"
              style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--red)', margin: '16px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Mic size={26} color="#fff" />
            </div>
          </div>
        )}

        {(phase === 'idle' || phase === 'speaking' || phase === 'readyToSpeak') && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleListen}
              disabled={phase === 'speaking'}
              className="card"
              style={{ flex: 1, border: 'none', cursor: 'pointer', textAlign: 'center', background: '#f3e8ff', color: '#7c5cfc', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <Headphones size={24} />
              Listen
            </button>
            <button
              onClick={() => {
                if (phase === 'readyToSpeak') {
                  handleSpeak();
                } else {
                  setNudge('Tap "Listen" first to hear the sound!');
                  setTimeout(() => setNudge(''), 2500);
                }
              }}
              className="card"
              style={{
                flex: 1, cursor: 'pointer', textAlign: 'center', background: '#d1fae5', color: '#10b981', fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                border: phase === 'readyToSpeak' ? '2px solid #10b981' : 'none',
              }}
            >
              <Mic size={24} />
              Speak
            </button>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 28 }}>
        Enjoyed it?{' '}
        <a href="/signup" style={{ color: 'var(--navy)', fontWeight: 700 }}>
          Sign Up for full access →
        </a>
      </p>
    </main>
  );
}
