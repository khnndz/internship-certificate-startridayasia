import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUsers } from '@/lib/data-kv';

export async function GET() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const users = await getUsers();
  
  const safeUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    posisi: user.posisi,              // ✅ CHANGED
    periode_start: user.periode_start,  // ✅ ADDED
    periode_end: user. periode_end,      // ✅ ADDED
    certificates: user.certificates,
  }));

  return NextResponse.json({ users: safeUsers });
}