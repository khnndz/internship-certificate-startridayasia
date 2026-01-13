import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/data-kv';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status:  401 }
      );
    }

    const user = await getUserByEmail(session.email);

    return NextResponse.json({
      user:  {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        posisi: user?.posisi,              // ✅ CHANGED
        periode_start: user?.periode_start,  // ✅ ADDED
        periode_end: user?.periode_end,      // ✅ ADDED
        certificates:  user?.certificates || [],
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}