'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, LogOut, Save } from 'lucide-react';
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
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 72px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>My Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Manage your account details and avatar.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: 28, marginTop: 32 }} className="profile-grid">
        <div className="card" style={{ textAlign: 'center' }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 96, height: 96, borderRadius: '50%', background: 'var(--cream-bg)', margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
              border: '3px solid var(--navy)',
            }}
          >
            <span style={{ fontSize: 34, fontWeight: 800, color: 'var(--navy)' }}>{initial}</span>
            <div
              style={{
                position: 'absolute', bottom: 0, right: 0, background: 'var(--navy)',
                borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Camera size={14} color="#fff" />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            />
          </div>
          <p style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 14 }}>{currentUsername || 'Learner'}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tap avatar to change photo</p>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', marginTop: 20, padding: 12, borderRadius: 12,
              border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13,
            }}
          >
            <LogOut size={15} /> Logout Account
          </button>
        </div>

        <div className="card">
          {message && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {message}
            </div>
          )}

          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Username</label>
          <input className="input-cream" style={{ marginTop: 6, marginBottom: 16 }} value={username} onChange={(e) => setUsername(e.target.value)} />

          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
          <input className="input-cream" style={{ marginTop: 6 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ marginTop: 24, width: 'auto', padding: '13px 26px' }}>
            {isSaving ? <span className="spinner" /> : (<><Save size={16} /> Save Changes</>)}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
