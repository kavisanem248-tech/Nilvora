import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const PRIVATE_DOCS_DIR = path.join(process.cwd(), '.data', 'documents');

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '') || request.headers.get('x-nilvora-token');
    const session = getSession(token);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string | null;
    const propertyId = formData.get('propertyId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided in form submission.' }, { status: 400 });
    }

    // 1. MIME Type Validation (Strict Security Guard against executable scripts)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type "${file.type}". Allowed formats: PDF, JPEG, PNG, WebP only. Executables, scripts, or active macros are strictly prohibited.`,
        },
        { status: 400 }
      );
    }

    // 2. File Size Limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum permitted limit of 10 MB.' },
        { status: 400 }
      );
    }

    // 3. Ensure Private Storage Directory Exists
    if (!fs.existsSync(PRIVATE_DOCS_DIR)) {
      fs.mkdirSync(PRIVATE_DOCS_DIR, { recursive: true });
    }

    // 4. Read File Buffer & Compute Anti-Tampering Checksum
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    // 5. Store File with Obfuscated Storage Identifier
    const safeExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const storageId = `doc_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${safeExt}`;
    const filePath = path.join(PRIVATE_DOCS_DIR, storageId);
    fs.writeFileSync(filePath, buffer);

    // 6. Log Document Upload in Audit Ledger
    db.addAuditLog({
      userId: session?.user.id || 'anonymous_uploader',
      action: 'DOCUMENT_UPLOADED_PRIVATE',
      resource: 'property_documents',
      resourceId: storageId,
      details: {
        originalName: file.name,
        documentType: documentType || 'general_title_doc',
        propertyId: propertyId || 'pending_assignment',
        mimeType: file.type,
        sizeBytes: file.size,
        sha256Checksum: checksum,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded securely to private storage with SHA-256 integrity check.',
        document: {
          id: `doc-${Date.now()}`,
          fileName: file.name,
          documentType: documentType || 'sale_deed',
          storagePath: `/api/documents/${storageId}`,
          checksum,
          sizeBytes: file.size,
          isPrivate: true,
          isVerified: false,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error uploading document' },
      { status: 500 }
    );
  }
}
