import Navbar from './Navbar';

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-cream" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex' }} className="auth-split">
        <div
          className="auth-left-panel"
          style={{
            flex: 1, background: 'linear-gradient(145deg, #1e3a8a, #4361ee)', color: '#fff',
            padding: '64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute', width: 320, height: 320, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', top: -120, right: -100,
            }}
          />
          <div
            style={{
              position: 'absolute', width: 220, height: 220, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', bottom: -80, left: -60,
            }}
          />
          <div style={{ position: 'relative', maxWidth: 420 }}>
            {eyebrow && (
              <span
                style={{
                  display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '6px 14px',
                  borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 20,
                }}
              >
                {eyebrow}
              </span>
            )}
            <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, margin: 0 }}>{title}</h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 16, lineHeight: 1.6 }}>
              {subtitle}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 36 }}>
              {['Phonics A-Z', 'Numbers', 'اردو'].map((label) => (
                <span
                  key={label}
                  style={{
                    background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 10,
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="auth-right-panel"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
