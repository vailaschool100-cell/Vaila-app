'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { checkStatus } from '@/lib/api/auth';

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
    <main
      className="page-dark"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100vh', textAlign: 'center' }}
    >
      {!isApproved ? (
        <>
          <div
            style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="spinner-dark" />
          </div>
          <h1 style={{ color: 'var(--sky)', fontSize: 22, fontWeight: 800, marginTop: 24 }}>
            Waiting for Confirmation...
          </h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: 360, marginTop: 8 }}>
            An admin is reviewing your payment proof. This page will update automatically once
            you&apos;re approved.
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{
              marginTop: 32, padding: '12px 24px', borderRadius: 12,
              border: '1px solid var(--sky)', background: 'transparent', color: 'var(--sky)',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Back to Login
          </button>
        </>
      ) : (
        <div className="card-dark" style={{ maxWidth: 360 }}>
          <CheckCircle2 size={48} color="#34d399" />
          <h2 style={{ color: '#34d399', marginTop: 12 }}>Account Approved!</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
            Your account has been approved. You can now log in.
          </p>
          <button onClick={() => router.push('/login')} className="btn-dark" style={{ marginTop: 16 }}>
            Login Now →
          </button>
        </div>
      )}
    </main>
  );
}

export default function WaitingApprovalPage() {
  return (
    <Suspense fallback={<main className="page-dark" />}>
      <WaitingApprovalInner />
    </Suspense>
  );
}
