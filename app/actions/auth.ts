'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/data-kv';
import { createSession, setSessionCookie, clearSession } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Invalid email format' };
  }

  // Limit input length to prevent DoS
  if (email.length > 255 || password.length > 128) {
    return { error: 'Input too long' };
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch {
    isValidPassword = false;
  }

  if (!isValidPassword) {
    return { error: 'Invalid email or password' };
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
