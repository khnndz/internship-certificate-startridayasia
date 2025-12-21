import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/data-kv';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const users = await getUsers();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let deletedCount = 0;
    let hasChanges = false;

    for (const user of users) {
      if (!user.certificates || user.certificates.length === 0) continue;

      const validCertificates = user.certificates.filter((cert) => {
        if (!cert.expiryDate) return true;

        const expiryDate = new Date(cert.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
          try {
            const filePath = path.join(process.cwd(), 'public', 'certificates', cert.file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.error(`Error deleting file ${cert.file}:`, error);
          }
          deletedCount++;
          return false;
        }
        return true;
      });

      if (validCertificates.length !== user.certificates.length) {
        user.certificates = validCertificates;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await saveUsers(users);
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. ${deletedCount} expired certificate(s) deleted.`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error in cleanup job:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Cleanup failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
