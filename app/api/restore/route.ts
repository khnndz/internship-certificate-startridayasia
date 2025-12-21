import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveUsers } from '@/lib/data-kv';
import { User } from '@/lib/types';

interface BackupData {
  version: string;
  exportedAt: string;
  users: User[];
}

/**
 * POST /api/restore
 * Restore data from backup JSON
 * Only accessible by admin
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const backupData: BackupData = await request.json();

    // Validate backup structure
    if (!backupData.version || !backupData.users || !Array.isArray(backupData.users)) {
      return NextResponse.json(
        { error: 'Invalid backup format' },
        { status: 400 }
      );
    }

    // Validate each user has required fields
    for (const user of backupData.users) {
      if (!user.id || !user.email || !user.password || !user.role) {
        return NextResponse.json(
          { error: 'Invalid user data in backup' },
          { status: 400 }
        );
      }
    }

    // Ensure at least one admin exists
    const hasAdmin = backupData.users.some(u => u.role === 'admin');
    if (!hasAdmin) {
      return NextResponse.json(
        { error: 'Backup must contain at least one admin user' },
        { status: 400 }
      );
    }

    // Save restored data
    const saved = await saveUsers(backupData.users);

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save restored data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Restored ${backupData.users.length} users successfully`,
      restoredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
