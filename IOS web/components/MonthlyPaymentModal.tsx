'use client';

import { useRef, useState } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import { uploadMonthlyPayment } from '@/lib/api/auth';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlyPaymentModal({
  username,
  onClose,
  onSuccess,
}: {
  username: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();
  const month = MONTH_NAMES[now.getMonth()];
  const year = String(now.getFullYear());

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload bank payment screenshot before submitting.');
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      await uploadMonthlyPayment(username, month, year, file);
      onSuccess();
    } catch {
      setError('Could not submit payment proof. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: 480,
          borderRadius: '24px 24px 0 0',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#b45309', margin: 0 }}>
            Monthly Fee Lock 💳
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            <X size={22} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
          Your monthly fee ({month} {year}) is due. Upload your payment screenshot to continue
          using Vaila App.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <label
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'block',
            marginTop: 16,
            padding: 24,
            borderRadius: 16,
            border: `2px dashed ${file ? 'var(--green)' : '#d1d5db'}`,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
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

        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="btn-primary"
          style={{ marginTop: 20 }}
        >
          {isUploading ? <span className="spinner" /> : 'Submit Payment Proof'}
        </button>
      </div>
    </div>
  );
}
