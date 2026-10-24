'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hash, BookOpen, Languages, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/session';

const LESSONS = [
  { mode: 'alphabets', title: 'Phonics A-Z', desc: '26 letters, each with a themed sample word.', icon: BookOpen, color: 'var(--navy)', bg: '#e0eaff' },
  { mode: 'numbers', title: 'Numbers', desc: 'Count from one all the way to a thousand.', icon: Hash, color: 'var(--red)', bg: '#fde2e2' },
  { mode: 'urdu', title: 'اردو حروف تہجی', desc: '79 Urdu words across five word families.', icon: Languages, color: 'var(--green)', bg: '#dcfce7' },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername(getUser()?.username || '');
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 72px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
        {username ? `Welcome, ${username} 👋` : 'Welcome 👋'}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
        Pick a module to continue practicing. Your progress is saved automatically.
      </p>

      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 22, marginTop: 36,
        }}
      >
        {LESSONS.map((lesson) => {
          const Icon = lesson.icon;
          return (
            <button
              key={lesson.mode}
              onClick={() => router.push(`/practice/${lesson.mode}`)}
              className="card"
              style={{ border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <div
                style={{
                  width: 52, height: 52, borderRadius: 14, background: lesson.bg, color: lesson.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon size={24} />
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: lesson.color, marginTop: 16 }}>{lesson.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{lesson.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, color: lesson.color, fontWeight: 700, fontSize: 14 }}>
                Start practicing <ArrowRight size={15} />
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 56 }}>
        © VAILA&apos;S School for Hearing Impaired Students
      </p>
    </main>
  );
}
