'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { getToken, clearSession } from '@/lib/session';
import ConfirmDialog from './ConfirmDialog';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
    setMenuOpen(false);
  }, [pathname]);

  const handleLogoutConfirmed = () => {
    clearSession();
    setShowLogoutConfirm(false);
    router.push('/login');
  };

  const loggedOutLinks = (
    <>
      <Link href="/demo" style={navLinkStyle}>
        Try a Demo
      </Link>
      <Link href="/login" style={navLinkStyle}>
        Login
      </Link>
      <Link href="/signup" style={navButtonStyle}>
        Sign Up
      </Link>
    </>
  );

  const loggedInLinks = (
    <>
      <Link href="/dashboard" style={navLinkStyle}>
        Dashboard
      </Link>
      <Link href="/profile" style={navLinkStyle}>
        Profile
      </Link>
      <button
        onClick={() => setShowLogoutConfirm(true)}
        style={{ ...navButtonStyle, background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <LogOut size={15} /> Logout
      </button>
    </>
  );

  return (
    <>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 300, background: 'rgba(251,248,241,0.92)',
          backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1120, margin: '0 auto', padding: '14px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Link href={loggedIn ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Vaila" style={{ height: 44, width: 'auto', borderRadius: 8 }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--navy)' }}>Vaila</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="navbar-desktop-links">
            {loggedIn ? loggedInLinks : loggedOutLinks}
          </nav>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="navbar-menu-button"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy)' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div
            className="navbar-mobile-menu"
            style={{
              borderTop: '1px solid rgba(0,0,0,0.06)', padding: '12px 24px',
              display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--cream-bg)',
            }}
          >
            {loggedIn ? loggedInLinks : loggedOutLinks}
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 760px) {
          .navbar-desktop-links { display: none !important; }
          .navbar-menu-button { display: block !important; }
        }
        @media (min-width: 761px) {
          .navbar-mobile-menu { display: none !important; }
        }
      `}</style>

      {showLogoutConfirm && (
        <ConfirmDialog
          title="Log out of Vaila?"
          message="You'll need to sign in again to continue practicing."
          confirmLabel="Logout"
          onConfirm={handleLogoutConfirmed}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: 'var(--navy)',
  fontWeight: 600,
  fontSize: 14,
};

const navButtonStyle: React.CSSProperties = {
  background: 'var(--navy)',
  color: '#fff',
  padding: '9px 18px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  border: 'none',
  cursor: 'pointer',
};
