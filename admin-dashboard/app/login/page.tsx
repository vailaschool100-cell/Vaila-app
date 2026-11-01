'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email === 'Admin@vaila.com' && password === 'Admin123') {
      localStorage.setItem('vaila_admin_token', 'admin_jwt_token_2026');
      localStorage.setItem('vaila_admin_role', 'admin');
      localStorage.setItem('vaila_admin_username', 'Admin');
      router.push('/');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email_or_username', email);
      formData.append('password', password);
      const res = await fetch(`${API_URL}/api/admin/teacher-login`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('vaila_admin_token', data.token);
        localStorage.setItem('vaila_admin_role', 'teacher');
        localStorage.setItem('vaila_admin_username', data.username);
        router.push('/');
      } else {
        setError('Invalid credentials. Use Admin@vaila.com/Admin123 or your teacher account.');
        setLoading(false);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="login-card" style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#1e293b',
        borderRadius: '24px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        padding: '40px 32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #06b6d4, #4361ee)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: '#fff',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            V
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: '800', margin: 0 }}>
            Admin / Teacher Login
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
            Vaila Phonics Teaching System Management
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid #f43f5e',
            color: '#fda4af',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Email / Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="Admin@vaila.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '14px 16px 14px 44px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '16px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '14px 16px 14px 44px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '16px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#4361ee',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(67, 97, 238, 0.4)'
            }}
          >
            {loading ? 'Logging in...' : 'Login ➔'}
          </button>
        </form>
      </div>
    </div>
  );
}
