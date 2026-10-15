'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Lightbulb, Headphones, Mic, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { getItemsForMode, getSpeechText, modeLabel, LETTER_PHONETIC_SOUNDS, PracticeMode } from '@/lib/content';
import { getUser, getToken, getProgress, saveProgress } from '@/lib/session';
import { speakNTimes, cancelSpeak } from '@/lib/tts';
import { startRecording, RecordingHandle } from '@/lib/recorder';
import { evaluateAudio, EvaluationResult } from '@/lib/api/evaluate';
import ConfirmDialog from '@/components/ConfirmDialog';
import MirrorCamera from './_components/MirrorCamera';
import InstructionsModal from './_components/InstructionsModal';

type Phase = 'idle' | 'speaking' | 'readyToSpeak' | 'listening' | 'evaluating' | 'result';

const VALID_MODES: PracticeMode[] = ['alphabets', 'numbers', 'urdu'];

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const rawMode = String(params.mode);
  const mode: PracticeMode = (VALID_MODES as string[]).includes(rawMode) ? (rawMode as PracticeMode) : 'alphabets';
  const items = getItemsForMode(mode);

  const [username, setUsername] = useState('Learner');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [speechCount, setSpeechCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [shake, setShake] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [nudge, setNudge] = useState('');

  const recordingRef = useRef<RecordingHandle | null>(null);
  const indexRef = useRef(currentIndex);
  indexRef.current = currentIndex;

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const user = getUser();
    const name = user?.username || 'Learner';
    setUsername(name);
    setCurrentIndex(getProgress(name, mode, items.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      saveProgress(username, mode, indexRef.current);
      cancelSpeak();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const current = items[currentIndex];

  const handleListen = async () => {
    if (phase === 'speaking' || phase === 'listening' || phase === 'evaluating') return;
    setEvalResult(null);
    setPhase('speaking');
    setSpeechCount(0);
    await speakNTimes(getSpeechText(current, mode), {
      mode,
      onEach: setSpeechCount,
    });
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
        target_alphabet: current.letter.toUpperCase(),
        phonetic_sound: current.sound,
        whisper_transcription: '(no microphone access)',
        spoken_ipa: '',
        target_ipa: '',
        accuracy: 0,
        passed: false,
        threshold: 50,
        feedback: 'Could not access your microphone. Please allow microphone access and try again.',
      });
      setPhase('result');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const result = await evaluateAudio(recorded.blob, recorded.filename, current.letter, username, { source: 'web' });
    const finalResult: EvaluationResult = result || {
      target_alphabet: current.letter.toUpperCase(),
      phonetic_sound: current.sound,
      whisper_transcription: '(error)',
      spoken_ipa: '',
      target_ipa: '',
      accuracy: 0,
      passed: false,
      threshold: 50,
      feedback: 'Unable to connect to server. Please check your connection and try again.',
    };
    setEvalResult(finalResult);
    setPhase('result');
    if (!finalResult.passed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleStopEarly = () => {
    recordingRef.current?.stopEarly();
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(nextIndex);
    saveProgress(username, mode, nextIndex);
    setEvalResult(null);
    setPhase('idle');
  };

  const handleExitConfirmed = () => {
    cancelSpeak();
    router.push('/dashboard');
  };

  const phoneticHint =
    mode === 'alphabets'
      ? LETTER_PHONETIC_SOUNDS[current.letter.toLowerCase()] || ''
      : current.sound;

  return (
    <main className="page-cream" style={{ padding: '16px 16px 100px', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <MirrorCamera />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div
            style={{
              display: 'inline-block', background: 'var(--navy)', color: '#fff', fontSize: 10,
              fontWeight: 700, padding: '3px 10px', borderRadius: 10, marginBottom: 4,
            }}
          >
            VSCI&amp;HI
          </div>
          <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
            VAILA&apos;S Speech Trainer
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0' }}>
            {mode === 'numbers' ? 'NUMBERS' : 'PHONICS'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => setShowExit(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: 'none',
              borderRadius: 16, padding: '6px 10px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              cursor: 'pointer', color: 'var(--red)', fontWeight: 700, fontSize: 11,
            }}
          >
            <X size={12} /> Exit
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: 'none',
              borderRadius: 16, padding: '6px 10px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              cursor: 'pointer', color: '#7c5cfc', fontWeight: 700, fontSize: 11,
            }}
          >
            <Lightbulb size={12} /> Guidance
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
        ★ Inclusive Learning For Every Child ★
      </p>

      {/* Speaking banner */}
      {phase === 'speaking' && (
        <div style={{ textAlign: 'center', marginTop: 16, color: '#7c5cfc', fontWeight: 600 }}>
          🔊 &quot;{current.word}&quot; — {speechCount} of 3...
        </div>
      )}

      {/* Big glyph */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <div
          onClick={() => phase === 'idle' && handleListen()}
          className={shake ? 'shake' : undefined}
          style={{
            fontSize: mode === 'numbers' ? 72 : 100, fontWeight: 900, color: 'var(--navy)',
            cursor: 'pointer', lineHeight: 1.1,
          }}
        >
          {mode === 'numbers' ? current.letter : current.letter.toUpperCase()}
        </div>
        <p style={{ color: '#9ca3af', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{current.word}</p>
        {mode !== 'numbers' && (
          <p style={{ color: '#b5b5c3', fontSize: 13, fontStyle: 'italic' }}>sounds like &quot;{phoneticHint}&quot;</p>
        )}
      </div>

      {nudge && (
        <div
          style={{
            position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
            background: '#7c5cfc', color: '#fff', padding: '10px 18px', borderRadius: 12,
            fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {nudge}
        </div>
      )}

      {/* Interactive bottom section */}
      <div style={{ maxWidth: 420, margin: '24px auto 0' }}>
        {phase === 'evaluating' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <span className="spinner-dark" style={{ borderTopColor: '#7c5cfc', borderColor: 'rgba(124,92,252,0.2)' }} />
            <p style={{ fontWeight: 700, marginTop: 12 }}>Evaluating Speech...</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Please wait a moment</p>
          </div>
        )}

        {phase === 'result' && evalResult && (
          <div
            className="card"
            style={{ border: `2px solid ${evalResult.passed ? 'var(--green-accent)' : '#f43f5e'}`, textAlign: 'center' }}
          >
            {evalResult.passed ? (
              <CheckCircle2 size={36} color="#10b981" />
            ) : (
              <XCircle size={36} color="#f43f5e" />
            )}
            <h2 style={{ margin: '8px 0 0', color: evalResult.passed ? '#10b981' : '#f43f5e' }}>
              {evalResult.passed ? 'GREAT JOB!' : 'TRY AGAIN!'}
            </h2>
            <p style={{ fontWeight: 700, marginTop: 4 }}>Match Score: {evalResult.accuracy}%</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{evalResult.feedback}</p>
            {evalResult.passed ? (
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ marginTop: 12, background: 'var(--green-accent)' }}
              >
                Next {mode === 'numbers' ? 'Number' : 'Letter'} →
              </button>
            ) : (
              <button onClick={handleListen} className="btn-primary" style={{ marginTop: 12, background: '#7c5cfc' }}>
                Try Again 🔄
              </button>
            )}
          </div>
        )}

        {phase === 'listening' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700 }}>Listening... say &quot;{current.word}&quot;</p>
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', background: 'var(--navy)', borderRadius: 4,
                  width: `${(timeLeft / 12) * 100}%`, transition: 'width 1s linear',
                }}
              />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{timeLeft}s remaining</p>
            <div
              onClick={handleStopEarly}
              className="pulse"
              style={{
                width: 70, height: 70, borderRadius: '50%', background: 'var(--red)', margin: '16px auto 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Mic size={30} color="#fff" />
            </div>
            <p style={{ color: '#10b981', fontSize: 13, marginTop: 8 }}>Recording your voice... 🎤</p>
          </div>
        )}

        {(phase === 'idle' || phase === 'speaking') && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleListen}
              disabled={phase === 'speaking'}
              className="card"
              style={{
                flex: 1, border: 'none', cursor: 'pointer', textAlign: 'center',
                background: '#f3e8ff', color: '#7c5cfc', fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <Headphones size={28} />
              Listen
            </button>
            <button
              onClick={() => {
                setNudge('Tap "Listen" first to hear the sound!');
                setTimeout(() => setNudge(''), 2500);
              }}
              className="card"
              style={{
                flex: 1, border: 'none', cursor: 'pointer', textAlign: 'center',
                background: '#d1fae5', color: '#10b981', fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                opacity: 1,
              }}
            >
              <Mic size={28} />
              Speak
            </button>
          </div>
        )}

        {phase === 'readyToSpeak' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleListen}
              className="card"
              style={{
                flex: 1, border: 'none', cursor: 'pointer', textAlign: 'center',
                background: '#f3e8ff', color: '#7c5cfc', fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <Headphones size={28} />
              Listen
            </button>
            <button
              onClick={handleSpeak}
              className="card"
              style={{
                flex: 1, border: '2px solid #10b981', cursor: 'pointer', textAlign: 'center',
                background: '#d1fae5', color: '#10b981', fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <Mic size={28} />
              Speak
            </button>
          </div>
        )}
      </div>

      {/* Bottom progress */}
      <div style={{ maxWidth: 420, margin: '28px auto 0', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
          Your Progress · {current.letter.toUpperCase()} {currentIndex + 1}/{items.length}
        </p>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', background: 'var(--navy)', borderRadius: 3,
              width: `${((currentIndex + 1) / items.length) * 100}%`,
            }}
          />
        </div>
        <Trophy
          size={20}
          color={currentIndex === items.length - 1 ? '#f59e0b' : '#cbd5e1'}
          style={{ marginTop: 10 }}
        />
      </div>

      {showExit && (
        <ConfirmDialog
          title="Exit this lesson and choose another?"
          message="Your progress will be saved."
          onConfirm={handleExitConfirmed}
          onCancel={() => setShowExit(false)}
        />
      )}

      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}

      <p style={{ textAlign: 'center', fontSize: 10, color: '#d1d5db', marginTop: 4 }}>{modeLabel(mode)}</p>
    </main>
  );
}
