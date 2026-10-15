'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, LogOut } from 'lucide-react';
import { updateProfile } from '@/lib/api/auth';
import { fullUploadUrl } from '@/lib/api/client';
import { getUser, saveSession, getToken, clearSession } from '@/lib/session';

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setAvatarUrl(user.avatar_url || '');
    }
  }, []);

  const handleAvatarPick = async (file: File | null) => {
    if (!file || !username) return;
    setIsUploading(true);
    setMessage('');
    try {
      const data = await updateProfile(username, email, username, file);
      if (data.success && data.user) {
        const token = getToken() || '';
        saveSession(token, data.user);
        setAvatarUrl(data.user.avatar_url || '');
        setMessage('Profile picture updated!');
      }
    } catch {
      // silent failure, mirrors existing app behavior
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const initial = (username || '?').charAt(0).toUpperCase();

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 72px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>My Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Your account details and profile picture.</p>

      <div className="card" style={{ marginTop: 28, textAlign: 'center' }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 110, height: 110, borderRadius: '50%', background: 'var(--cream-bg)', margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
            border: '3px solid var(--navy)', overflow: 'hidden',
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fullUploadUrl(avatarUrl)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--navy)' }}>{initial}</span>
          )}

          <div
            style={{
              position: 'absolute', bottom: 0, right: 0, background: 'var(--navy)',
              borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isUploading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Camera size={15} color="#fff" />}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleAvatarPick(e.target.files?.[0] || null)}
          />
        </div>

        <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 18, marginTop: 16 }}>{username || 'Learner'}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{email}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Tap the avatar to change your profile picture</p>

        {message && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px 16px', borderRadius: 10, fontSize: 13, marginTop: 14, display: 'inline-block' }}>
            {message}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: '100%', marginTop: 24, padding: 13, borderRadius: 12,
            border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)',
            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14,
          }}
        >
          <LogOut size={16} /> Logout Account
        </button>
      </div>
    </main>
  );
}
