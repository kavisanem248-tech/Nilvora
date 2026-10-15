import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth/request-session';
import fs from 'fs';
import path from 'path';

const PRIVATE_DOCS_DIR = path.join(process.cwd(), '.data', 'documents');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getRequestSession(request)) {
      return NextResponse.json({ success: false, error: 'Sign in to access property documents.' }, { status: 401 });
    }

    // Sanitize storage identifier to prevent directory traversal
    const safeFilename = path.basename(id);
    const filePath = path.join(PRIVATE_DOCS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Document not found.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = safeFilename.split('.').pop()?.toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error downloading document' }, { status: 500 });
  }
}
