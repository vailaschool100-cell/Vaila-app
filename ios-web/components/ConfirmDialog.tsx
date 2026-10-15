'use client';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'OK',
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
      }}
    >
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%' }}>
        <h3 style={{ margin: 0, color: 'var(--navy)' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--navy)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
