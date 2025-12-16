import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUsers } from '@/lib/data';

export async function GET() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const users = getUsers();
  
  // Remove passwords from response
  const safeUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    certificates: user.certificates,
  }));

  return NextResponse.json({ users: safeUsers });
}
