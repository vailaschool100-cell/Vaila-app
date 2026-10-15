'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, LogOut } from 'lucide-react';
import { updateProfile } from '@/lib/api/auth';
import { getUser, saveSession, getToken, clearSession } from '@/lib/session';

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUsername(user.username);
      setUsername(user.username);
      setEmail(user.email);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const data = await updateProfile(username, email, currentUsername, avatar);
      if (data.success && data.user) {
        const token = getToken() || '';
        saveSession(token, data.user);
        setCurrentUsername(data.user.username);
        setMessage('Profile updated successfully!');
      }
    } catch {
      // mirrors the Flutter app: silent failure, no user-facing error
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const initial = (currentUsername || '?').charAt(0).toUpperCase();

  return (
    <main className="page-dark" style={{ padding: '32px 24px', maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>My Profile</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 110, height: 110, borderRadius: '50%', background: 'var(--dark-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
            border: '2px solid var(--sky)',
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>{initial}</span>
          <div
            style={{
              position: 'absolute', bottom: 0, right: 0, background: 'var(--indigo)',
              borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Camera size={16} color="#fff" />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {message && (
        <p style={{ textAlign: 'center', color: '#34d399', fontSize: 13, marginTop: 12 }}>{message}</p>
      )}

      <div style={{ marginTop: 28 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>Username</label>
        <input className="input-dark" style={{ marginTop: 6, marginBottom: 16 }} value={username} onChange={(e) => setUsername(e.target.value)} />

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>Email</label>
        <input className="input-dark" style={{ marginTop: 6 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <button onClick={handleSave} disabled={isSaving} className="btn-dark" style={{ marginTop: 24 }}>
          {isSaving ? <span className="spinner" /> : 'Save Profile Changes'}
        </button>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', marginTop: 14, padding: 14, borderRadius: 14,
            border: '1px solid var(--rose)', background: 'transparent', color: '#fda4af',
            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <LogOut size={18} /> Logout Account
        </button>
      </div>
    </main>
  );
}
