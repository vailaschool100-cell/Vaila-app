'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

// Purely a local self-view widget so the child can watch their mouth while
// practicing — no frame is ever captured or uploaded, matching the Flutter
// app's live "Mirror" camera preview exactly.
export default function MirrorCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setAvailable(true);
      } catch {
        setAvailable(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  return (
    <div
      onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
      style={{
        width: 90, height: 70, borderRadius: 12, overflow: 'hidden', position: 'relative',
        background: '#000', cursor: 'pointer', flexShrink: 0,
      }}
    >
      {available ? (
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <RotateCcw size={18} />
        </div>
      )}
      <span
        style={{
          position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center',
          fontSize: 9, color: '#fff', background: 'rgba(0,0,0,0.4)',
        }}
      >
        Mirror
      </span>
    </div>
  );
}
