import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { getCertificateFile } from '@/lib/file-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const resolvedParams = await params;
  const filename = resolvedParams.filename;

  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await getUserById(session.id);
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  if (session.role !== 'admin') {
    const hasAccess = user.certificates?.some(cert => cert.file === filename);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
  }

  try {
    const fileBuffer = await getCertificateFile(filename);
    
    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Error reading file' },
      { status: 500 }
    );
  }
}
