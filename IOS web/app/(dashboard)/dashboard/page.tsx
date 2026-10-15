'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { clearSession } from '@/lib/session';
import ConfirmDialog from '@/components/ConfirmDialog';

const LESSONS = [
  { mode: 'numbers', title: 'Numbers 1-1000', color: 'var(--red)' },
  { mode: 'alphabets', title: 'Phonics A-Z', color: 'var(--navy)' },
  { mode: 'urdu', title: 'اردو حروف تہجی', color: 'var(--green)' },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [showExit, setShowExit] = useState(false);

  const handleExitConfirmed = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <main className="page-cream" style={{ padding: '24px 20px 40px', position: 'relative' }}>
      <button
        onClick={() => setShowExit(true)}
        style={{
          position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 6,
          background: '#fff', border: 'none', borderRadius: 20, padding: '8px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', color: 'var(--red)', fontWeight: 700, fontSize: 13,
        }}
      >
        <X size={14} /> Exit
      </button>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div
          style={{
            width: 70, height: 70, borderRadius: '50%', margin: '0 auto',
            background: 'linear-gradient(135deg, #06b6d4, #4361ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 900, color: '#fff' }}>V</span>
        </div>
        <h1 style={{ color: 'var(--navy)', fontSize: 22, fontWeight: 900, marginTop: 12 }}>
          VAILA&apos;S Speech Trainer
        </h1>
        <h2 style={{ color: 'var(--red)', fontSize: 16, fontWeight: 800, marginTop: 4 }}>
          CHOOSE A LESSON
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          ★ Inclusive Learning For Every Child ★
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, maxWidth: 420, marginInline: 'auto' }}>
        {LESSONS.map((lesson) => (
          <button
            key={lesson.mode}
            onClick={() => router.push(`/practice/${lesson.mode}`)}
            className="card"
            style={{
              border: 'none', textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{ color: lesson.color, fontSize: 19, fontWeight: 800 }}>{lesson.title}</span>
            <span style={{ color: lesson.color, fontSize: 22 }}>→</span>
          </button>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 36 }}>
        © VAILA&apos;S School for Hearing Impaired Students
      </p>

      {showExit && (
        <ConfirmDialog
          title="Exit this lesson and choose another?"
          message="You'll be logged out and returned to the login screen."
          confirmLabel="OK"
          onConfirm={handleExitConfirmed}
          onCancel={() => setShowExit(false)}
        />
      )}
    </main>
  );
}
