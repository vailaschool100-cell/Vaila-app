'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock } from 'lucide-react';
import { checkStatus } from '@/lib/api/auth';
import Navbar from '@/components/Navbar';

function WaitingApprovalInner() {
  const router = useRouter();
  const params = useSearchParams();
  const username = params.get('username') || '';
  const [isApproved, setIsApproved] = useState(false);
  const approvedRef = useRef(false);

  useEffect(() => {
    if (!username) return;
    const interval = setInterval(async () => {
      if (approvedRef.current) return;
      try {
        const status = await checkStatus(username);
        if (status.is_approved && status.is_active) {
          approvedRef.current = true;
          setIsApproved(true);
          clearInterval(interval);
        }
      } catch {
        // swallow, keep polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [username]);

  return (
    <main className="page-cream" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, minHeight: 'calc(100vh - 65px)', textAlign: 'center',
        }}
      >
        {!isApproved ? (
          <div className="card" style={{ maxWidth: 420 }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
                background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Clock size={32} color="var(--navy)" />
            </div>
            <h1 style={{ color: 'var(--navy)', fontSize: 22, fontWeight: 800, marginTop: 20 }}>
              Waiting for Confirmation...
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
              An admin is reviewing your payment proof. This page updates automatically once
              you&apos;re approved.
            </p>
            <button
              onClick={() => router.push('/login')}
              style={{
                marginTop: 24, padding: '12px 24px', borderRadius: 12,
                border: '1px solid var(--navy)', background: 'transparent', color: 'var(--navy)',
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: 380, border: '2px solid var(--green-accent)' }}>
            <CheckCircle2 size={48} color="#10b981" />
            <h2 style={{ color: '#10b981', marginTop: 12 }}>Account Approved!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Your account has been approved. You can now log in.
            </p>
            <button onClick={() => router.push('/login')} className="btn-primary" style={{ marginTop: 16 }}>
              Login Now →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WaitingApprovalPage() {
  return (
    <Suspense fallback={<main className="page-cream" style={{ minHeight: '100vh' }} />}>
      <WaitingApprovalInner />
    </Suspense>
  );
}
