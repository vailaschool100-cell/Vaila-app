'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname?.includes('/profile') ? 'profile' : 'dashboard';

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-around', padding: '10px 0',
        zIndex: 100,
      }}
    >
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: active === 'dashboard' ? 'var(--sky)' : '#64748b', fontSize: 12, fontWeight: 600,
        }}
      >
        <Home size={22} />
        Home
      </button>
      <button
        onClick={() => router.push('/profile')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: active === 'profile' ? 'var(--sky)' : '#64748b', fontSize: 12, fontWeight: 600,
        }}
      >
        <User size={22} />
        Profile
      </button>
    </nav>
  );
}
