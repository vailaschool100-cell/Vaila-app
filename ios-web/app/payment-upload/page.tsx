'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { register } from '@/lib/api/auth';
import { takePendingSignup, PendingSignup } from '@/lib/session';

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

  if (!pending) return <main className="page-cream" />;

  return (
    <main className="page-cream" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Bank Payment Details</h1>

        <div className="card" style={{ marginTop: 20 }}>
          <Row label="Bank Name" value="Meezan Bank" />
          <Row label="Account Title" value="Vaila Teaching System" />
          <Row label="Account / IBAN" value="PK92 MEZN 0001 0203 0405 0607" />
          <Row label="Registration Fee" value="$10 / Rs. 2,000" last />
        </div>

        {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}

        <label
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'block', marginTop: 16, padding: 24, borderRadius: 16,
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
          style={{ marginTop: 20, background: 'var(--green-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {isSubmitting ? <span className="spinner" /> : (<>Submit Payment for Approval <ArrowRight size={18} /></>)}
        </button>
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
