'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { savePendingSignup } from '@/lib/session';

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
    <main className="page-dark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>Create Account</h1>

        <div style={{ marginTop: 24 }}>
          {error && <div className="error-banner-dark">{error}</div>}

          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>Username</label>
          <input
            className="input-dark"
            style={{ marginTop: 6, marginBottom: 16 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>Email</label>
          <input
            className="input-dark"
            style={{ marginTop: 6, marginBottom: 16 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>Password</label>
          <input
            className="input-dark"
            style={{ marginTop: 6, marginBottom: 16 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>Confirm Password</label>
          <input
            className="input-dark"
            style={{ marginTop: 6 }}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
          />

          <button onClick={handleContinue} className="btn-dark" style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Continue to Payment <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
