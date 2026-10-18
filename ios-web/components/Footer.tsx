export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 60, background: '#fff' }}>
      <div
        style={{
          maxWidth: 1120, margin: '0 auto', padding: '32px 24px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Vaila" style={{ height: 32, width: 'auto', borderRadius: 6 }} />
          <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 14 }}>Vaila</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          © {new Date().getFullYear()} VAILA&apos;S School for Hearing Impaired Students
        </p>
      </div>
    </footer>
  );
}
