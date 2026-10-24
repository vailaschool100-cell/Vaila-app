import { API_URL, fetchWithTimeout } from './client';
import type { VailaUser } from '../session';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: VailaUser;
  is_approved?: boolean;
  is_active?: boolean;
  requires_monthly_payment?: boolean;
  username?: string;
  message?: string;
  detail?: string;
}

export async function login(emailOrUsername: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_or_username: emailOrUsername, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.success) {
    return { success: false, message: data.detail || data.message || 'Login failed' };
  }
  return data as LoginResult;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
  detail?: string;
  username?: string;
}

export async function register(
  username: string,
  email: string,
  password: string,
  screenshot: File
): Promise<RegisterResult> {
  const form = new FormData();
  form.append('username', username);
  form.append('email', email);
  form.append('password', password);
  form.append('screenshot', screenshot, screenshot.name || 'registration_proof.png');

  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.success) {
    return { success: false, message: data.detail || data.message || 'Registration failed' };
  }
  return data as RegisterResult;
}

export interface CheckStatusResult {
  is_approved: boolean;
  is_active: boolean;
}

export async function checkStatus(username: string): Promise<CheckStatusResult> {
  const res = await fetch(`${API_URL}/api/auth/check-status/${encodeURIComponent(username)}`);
  if (!res.ok) return { is_approved: false, is_active: false };
  return res.json();
}

export async function uploadMonthlyPayment(
  username: string,
  month: string,
  year: string,
  screenshot: File
): Promise<{ success: boolean; message?: string }> {
  const form = new FormData();
  form.append('username', username);
  form.append('month', month);
  form.append('year', year);
  form.append('screenshot', screenshot, screenshot.name || 'monthly_fee.png');

  const res = await fetch(`${API_URL}/api/auth/upload-monthly-payment`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  return data;
}

export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  const res = await fetchWithTimeout(`${API_URL}/api/auth/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  return { exists: !!data.exists };
}

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetchWithTimeout(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, new_password: newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.detail || data.message || 'This email is not registered' };
  }
  return { success: true, message: data.message };
}

export async function updateProfile(
  username: string,
  email: string,
  currentUsername: string,
  avatar?: File | null
): Promise<{ success: boolean; user?: VailaUser }> {
  const form = new FormData();
  form.append('username', username);
  form.append('email', email);
  form.append('current_username', currentUsername);
  if (avatar) form.append('avatar', avatar, avatar.name || 'avatar.png');

  const res = await fetch(`${API_URL}/api/auth/update-profile`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}
