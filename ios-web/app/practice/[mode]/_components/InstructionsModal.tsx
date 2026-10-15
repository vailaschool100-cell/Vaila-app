'use client';

const STEPS = [
  'Look at the letter, number, or word shown on screen.',
  'Tap "Listen" to hear it pronounced 3 times.',
  'Tap "Speak" when you\'re ready.',
  'Say the sound clearly into your microphone.',
  'Wait a moment for AI evaluation.',
  'Pass and you\'ll automatically move to the next one.',
  'Speak loudly and clearly for the best results!',
];

export default function InstructionsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <h2 style={{ color: 'var(--navy)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          💡 How to Practice
        </h2>
        <ol style={{ paddingLeft: 20, marginTop: 16 }}>
          {STEPS.map((step, i) => (
            <li key={i} style={{ marginBottom: 10, color: '#374151', fontSize: 14 }}>
              {step}
            </li>
          ))}
        </ol>
        <button onClick={onClose} className="btn-primary" style={{ marginTop: 8 }}>
          Got it!
        </button>
      </div>
    </div>
  );
}
