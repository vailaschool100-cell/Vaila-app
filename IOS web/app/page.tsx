'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, LogIn, UserPlus } from 'lucide-react';
import { getToken } from '@/lib/session';

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace('/dashboard');
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return <main className="page-cream" />;
  }

  return (
    <main
      className="page-cream"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #06b6d4, #4361ee)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 42, fontWeight: 900, color: '#fff' }}>V</span>
      </div>

      <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
        VAILA&apos;S Speech Trainer
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8, maxWidth: 420 }}>
        Phonics &amp; speech practice for children — English letters, numbers, and Urdu, with
        instant AI feedback on every word.
      </p>

      <button
        onClick={() => router.push('/demo')}
        className="btn-primary"
        style={{ maxWidth: 320, marginTop: 36, fontSize: 18, padding: '18px 24px' }}
      >
        <PlayCircle size={22} />
        Start a Demo
      </button>

      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
        Try 4 words from every module — no sign up needed.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button
          onClick={() => router.push('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            borderRadius: 12,
            border: '1px solid var(--navy)',
            background: 'transparent',
            color: 'var(--navy)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <LogIn size={18} /> Login
        </button>
        <button
          onClick={() => router.push('/signup')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--navy)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <UserPlus size={18} /> Sign Up
        </button>
      </div>
    </main>
  );
}
