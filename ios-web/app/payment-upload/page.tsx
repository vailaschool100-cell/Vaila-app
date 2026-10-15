'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle2, ArrowRight, Landmark } from 'lucide-react';
import { register } from '@/lib/api/auth';
import { takePendingSignup, PendingSignup } from '@/lib/session';
import Navbar from '@/components/Navbar';

export default function PaymentUploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingSignup | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = takePendingSignup();
    if (!data) {
      router.replace('/signup');
      return;
    }
    setPending(data);
  }, [router]);

  const handleSubmit = async () => {
    if (!pending) return;
    if (!file) {
      setError('Please upload bank payment screenshot before submitting.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const data = await register(pending.username, pending.email, pending.password, file);
      if (data.success) {
        router.replace(`/waiting-approval?username=${encodeURIComponent(pending.username)}`);
      } else {
        setError(data.detail || data.message || 'Registration failed');
      }
    } catch {
      setError('Server timeout waking up backend. Please tap Submit again in a few seconds.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pending) return <main className="page-cream" style={{ minHeight: '100vh' }} />;

  return (
    <main className="page-cream" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#15803d',
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            }}
          >
            Step 2 of 2
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', marginTop: 14 }}>
            Complete your registration
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
            One-time registration fee — pay and upload your receipt below.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Landmark size={20} color="var(--navy)" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Bank Payment Details</h2>
            </div>
            <Row label="Bank Name" value="Meezan Bank" />
            <Row label="Account Title" value="Vaila Teaching System" />
            <Row label="Account / IBAN" value="PK92 MEZN 0001 0203 0405 0607" />
            <Row label="Registration Fee" value="$10 / Rs. 2,000" last />
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', margin: '0 0 12px' }}>
              Upload Payment Proof
            </h2>

            {error && <div className="error-banner">{error}</div>}

            <label
              onClick={() => fileRef.current?.click()}
              style={{
                display: 'block', padding: 28, borderRadius: 16,
                border: `2px dashed ${file ? 'var(--green)' : '#d1d5db'}`, textAlign: 'center', cursor: 'pointer',
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div style={{ color: 'var(--green)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={28} />
                  Screenshot Attached Successfully!
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <Upload size={28} />
                  Tap to upload payment screenshot
                </div>
              )}
            </label>

            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary"
              style={{ marginTop: 20, background: 'var(--green-accent)' }}>
              {isSubmitting ? <span className="spinner" /> : (<>Submit Payment for Approval <ArrowRight size={18} /></>)}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : '1px solid #f1f1f1' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span>
    </div>
  );
}
