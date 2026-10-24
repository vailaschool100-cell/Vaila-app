'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { checkEmail, resetPassword } from '@/lib/api/auth';
import AuthLayout from '@/components/AuthLayout';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { exists } = await checkEmail(email.trim());
      if (exists) {
        setStep('reset');
      } else {
        setError('This email is not registered.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await resetPassword(email.trim(), newPassword);
      if (data.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1200);
      } else {
        setError(data.message || 'This email is not registered.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Forgot your password?"
      subtitle="Enter the email you registered with and we'll help you set a new password right here."
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
        {step === 'email' ? 'Reset Password' : 'Set a New Password'}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
        {step === 'email'
          ? 'Enter your registered email address to continue.'
          : `Email verified for ${email}. Choose a new password below.`}
      </p>

      <div style={{ marginTop: 24 }}>
        {error && <div className="error-banner">{error}</div>}
        {success && (
          <div
            style={{
              background: '#dcfce7', color: '#15803d', padding: '12px 16px',
              borderRadius: 12, fontSize: 14, marginBottom: 16,
            }}
          >
            {success}
          </div>
        )}

        {step === 'email' ? (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative', marginTop: 6 }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: 15, color: '#9ca3af' }} />
              <input
                className="input-cream"
                style={{ paddingLeft: 42 }}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleCheckEmail()}
              />
            </div>

            <button onClick={handleCheckEmail} disabled={isLoading} className="btn-primary" style={{ marginTop: 20 }}>
              {isLoading ? <span className="spinner" /> : (<>Continue <ArrowRight size={18} /></>)}
            </button>
          </>
        ) : (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>New Password</label>
            <div style={{ position: 'relative', marginTop: 6, marginBottom: 16 }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: 15, color: '#9ca3af' }} />
              <input
                className="input-cream"
                style={{ paddingLeft: 42 }}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Confirm New Password</label>
            <div style={{ position: 'relative', marginTop: 6 }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: 15, color: '#9ca3af' }} />
              <input
                className="input-cream"
                style={{ paddingLeft: 42 }}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
              />
            </div>

            <button onClick={handleResetPassword} disabled={isLoading} className="btn-primary" style={{ marginTop: 20 }}>
              {isLoading ? <span className="spinner" /> : 'Update Password'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Remembered it?{' '}
          <a href="/login" style={{ color: 'var(--navy)', fontWeight: 700 }}>
            Back to Login
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
