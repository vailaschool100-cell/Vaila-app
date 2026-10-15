'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { savePendingSignup } from '@/lib/session';
import AuthLayout from '@/components/AuthLayout';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    savePendingSignup({ username: username.trim(), email: email.trim(), password });
    router.push('/payment-upload');
  };

  return (
    <AuthLayout
      eyebrow="Join Vaila"
      title="Start your child's speech journey today."
      subtitle="Create an account to track progress, unlock every module, and pick up exactly where you left off — on any device."
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Create Account</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
        It only takes a minute.
      </p>

      <div style={{ marginTop: 24 }}>
        {error && <div className="error-banner">{error}</div>}

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Username</label>
        <input
          className="input-cream"
          style={{ marginTop: 6, marginBottom: 16 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
        <input
          className="input-cream"
          style={{ marginTop: 6, marginBottom: 16 }}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
        <input
          className="input-cream"
          style={{ marginTop: 6, marginBottom: 16 }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Confirm Password</label>
        <input
          className="input-cream"
          style={{ marginTop: 6 }}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />

        <button onClick={handleContinue} className="btn-primary" style={{ marginTop: 24 }}>
          Continue to Payment <ArrowRight size={18} />
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--navy)', fontWeight: 700 }}>
            Login
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
