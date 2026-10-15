'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, UserPlus, Headphones, Mic, Sparkles, BookOpen, Hash, Languages } from 'lucide-react';
import { getToken } from '@/lib/session';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    return <main className="page-cream" style={{ minHeight: '100vh' }} />;
  }

  return (
    <main className="page-cream" style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 48 }}>
          <div style={{ flex: '1 1 420px' }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0f2fe', color: '#0369a1',
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              }}
            >
              <Sparkles size={14} /> AI-powered speech feedback
            </span>
            <h1 style={{ fontSize: 44, fontWeight: 900, color: 'var(--navy)', lineHeight: 1.15, margin: '20px 0 0' }}>
              Speech &amp; phonics practice, made for every child.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-muted)', marginTop: 18, lineHeight: 1.7, maxWidth: 480 }}>
              English alphabets, numbers, and Urdu — with instant AI feedback on every word a
              child speaks. Built for children with hearing aids and cochlear implants.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 32 }}>
              <button
                onClick={() => router.push('/demo')}
                className="btn-primary"
                style={{ width: 'auto', padding: '16px 28px', fontSize: 16 }}
              >
                <PlayCircle size={20} /> Start a Free Demo
              </button>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '16px 28px', borderRadius: 14,
                  border: '2px solid var(--navy)', background: 'transparent', color: 'var(--navy)',
                  fontWeight: 700, fontSize: 16, cursor: 'pointer',
                }}
              >
                <UserPlus size={18} /> Sign Up
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 14 }}>
              No signup needed for the demo — try 4 words from every module.
            </p>
          </div>

          <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '100%', maxWidth: 360, aspectRatio: '1', borderRadius: 32,
                background: 'linear-gradient(145deg, #1e3a8a, #06b6d4)', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div
                className="card"
                style={{ width: 160, padding: 24, textAlign: 'center', position: 'absolute', top: 24, left: 24, transform: 'rotate(-6deg)' }}
              >
                <span style={{ fontSize: 44, fontWeight: 900, color: 'var(--navy)' }}>A</span>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Apple</p>
              </div>
              <div
                className="card"
                style={{ width: 150, padding: 22, textAlign: 'center', position: 'absolute', bottom: 28, right: 20, transform: 'rotate(5deg)' }}
              >
                <span style={{ fontSize: 40, fontWeight: 900, color: 'var(--green)' }}>بال</span>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Baal</p>
              </div>
              <div
                style={{
                  width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Mic size={38} color="#fff" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 64px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>
          Three modules, one goal: confident speech
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 36 }}>
          <FeatureCard icon={<BookOpen size={26} />} color="#1e3a8a" title="Phonics A-Z" desc="26 letters, each with a themed word and a pronunciation hint." />
          <FeatureCard icon={<Hash size={26} />} color="#d32f2f" title="Numbers 1-1000" desc="Count from one to a thousand with guided speech practice." />
          <FeatureCard icon={<Languages size={26} />} color="#16a34a" title="اردو الفاظ" desc="79 Urdu words across five rhyming word families." />
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginTop: 36 }}>
            <StepCard number={1} icon={<Headphones size={24} />} title="Listen" desc="Hear the word pronounced three times." />
            <StepCard number={2} icon={<Mic size={24} />} title="Speak" desc="Record yourself saying it into the mic." />
            <StepCard number={3} icon={<Sparkles size={24} />} title="Get feedback" desc="AI instantly scores your pronunciation." />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)' }}>Ready to start practicing?</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          Try the demo first, or sign up to unlock every module.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/demo')} className="btn-primary" style={{ width: 'auto', padding: '14px 28px' }}>
            <PlayCircle size={18} /> Try the Demo
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div className="card">
      <div
        style={{
          width: 52, height: 52, borderRadius: 14, background: `${color}1a`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginTop: 16 }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{desc}</p>
    </div>
  );
}

function StepCard({ number, icon, title, desc }: { number: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--cream-bg)', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', position: 'relative',
        }}
      >
        {icon}
        <span
          style={{
            position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: '50%',
            background: 'var(--navy)', color: '#fff', fontSize: 11, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {number}
        </span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginTop: 14 }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{desc}</p>
    </div>
  );
}
