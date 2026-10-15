export interface VailaUser {
  username: string;
  email: string;
  role?: string;
  avatar_url?: string;
  is_approved?: boolean;
  is_active?: boolean;
}

const TOKEN_KEY = 'vaila_token';
const USER_KEY = 'vaila_user';

export function saveSession(token: string, user: VailaUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): VailaUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VailaUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function progressKey(username: string, mode: string) {
  return `vaila_progress_${username}_${mode}`;
}

export function saveProgress(username: string, mode: string, index: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(progressKey(username, mode), String(index));
}

export function getProgress(username: string, mode: string, maxLen: number): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(progressKey(username, mode));
  if (raw === null) return 0;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0 || n >= maxLen) return 0;
  return n;
}

const PENDING_SIGNUP_KEY = 'vaila_pending_signup';

export interface PendingSignup {
  username: string;
  email: string;
  password: string;
}

export function savePendingSignup(data: PendingSignup) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(data));
}

export function takePendingSignup(): PendingSignup | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
  sessionStorage.removeItem(PENDING_SIGNUP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingSignup;
  } catch {
    return null;
  }
}
