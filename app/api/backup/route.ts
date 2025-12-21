import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUsers } from '@/lib/data-kv';

/**
 * GET /api/backup
 * Download backup data (users + certificates info) as JSON
 * Only accessible by admin
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const users = await getUsers();
    
    // Create backup data with metadata
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: session.email,
      totalUsers: users.length,
      totalCertificates: users.reduce((acc, u) => acc + (u.certificates?.length || 0), 0),
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password, // Hashed password
        role: user.role,
        status: user.status,
        certificates: user.certificates || [],
      })),
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `backup-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}
