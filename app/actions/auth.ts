'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getUserByEmail } from '@/lib/data-kv';
import { createSession, setSessionCookie, clearSession } from '@/lib/auth';
import { checkLoginRateLimit } from '@/lib/rate-limit';

export async function loginAction(formData: FormData) {
  // Get client IP for rate limiting
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
             headersList.get('x-real-ip') || 
             'unknown';
  
  // Check rate limit
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return { 
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${rateLimit.resetIn} detik.` 
    };
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password harus diisi' };
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Format email tidak valid' };
  }

  // Batasi panjang input untuk mencegah DoS
  if (email.length > 255 || password.length > 128) {
    return { error: 'Input terlalu panjang' };
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return { error: 'Email atau password salah' };
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch {
    isValidPassword = false;
  }

  if (!isValidPassword) {
    return { error: 'Email atau password salah' };
  }

  const token = await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  await setSessionCookie(token);

  if (user.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}
