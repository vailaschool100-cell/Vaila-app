'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { saveSession } from '@/lib/session';
import MonthlyPaymentModal from '@/components/MonthlyPaymentModal';
import AuthLayout from '@/components/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [paymentModalUser, setPaymentModalUser] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!emailOrUsername.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await login(emailOrUsername.trim(), password);

      if (data.success && data.token && data.user) {
        saveSession(data.token, data.user);
        router.replace('/dashboard');
        return;
      }

      if (data.is_approved === false) {
        router.push(`/waiting-approval?username=${encodeURIComponent(data.username || emailOrUsername)}`);
        return;
      }

      if (data.requires_monthly_payment) {
        setPaymentModalUser(data.username || emailOrUsername);
        return;
      }

      setError(data.detail || data.message || 'Login failed');
    } catch {
      setError('Connection timeout / server waking up. Please try signing in again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Pick up right where you left off."
      subtitle="Sign in to continue practicing across English letters, numbers, and Urdu — your progress is saved automatically."
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>Sign In</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
        Enter your details to access your account.
      </p>

      <div style={{ marginTop: 24 }}>
        {error && <div className="error-banner">{error}</div>}

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Username or Email</label>
        <div style={{ position: 'relative', marginTop: 6, marginBottom: 16 }}>
          <Mail size={18} style={{ position: 'absolute', left: 14, top: 15, color: '#9ca3af' }} />
          <input
            className="input-cream"
            style={{ paddingLeft: 42 }}
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
        <div style={{ position: 'relative', marginTop: 6 }}>
          <Lock size={18} style={{ position: 'absolute', left: 14, top: 15, color: '#9ca3af' }} />
          <input
            className="input-cream"
            style={{ paddingLeft: 42 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          onClick={() => setShowForgot(true)}
          style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, marginTop: 10, cursor: 'pointer' }}
        >
          Forgot password?
        </button>

        <button onClick={handleLogin} disabled={isLoading} className="btn-primary" style={{ marginTop: 20 }}>
          {isLoading ? <span className="spinner" /> : (<><LogIn size={18} /> Sign In</>)}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: 'var(--navy)', fontWeight: 700 }}>
            Sign Up
          </a>
        </p>
      </div>

      {showForgot && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 360 }}>
            <h3 style={{ margin: 0, color: 'var(--navy)' }}>Forgot Password?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Please contact Admin@vaila.com to reset your password.
            </p>
            <button onClick={() => setShowForgot(false)} className="btn-primary" style={{ marginTop: 12 }}>
              OK
            </button>
          </div>
        </div>
      )}

      {paymentModalUser && (
        <MonthlyPaymentModal
          username={paymentModalUser}
          onClose={() => setPaymentModalUser(null)}
          onSuccess={() => router.push(`/waiting-approval?username=${encodeURIComponent(paymentModalUser)}`)}
        />
      )}
    </AuthLayout>
  );
}
