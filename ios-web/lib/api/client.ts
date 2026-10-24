export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function fullUploadUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

// The backend is hosted on Render's free tier, which spins down when idle
// and can take 30-50s to wake up on the first request — the same reason
// other flows in this app (login, register) use long timeouts. Without a
// timeout here, a dead/misbehaving request would spin the UI forever with
// no way to recover short of a page reload.
export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 45000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
