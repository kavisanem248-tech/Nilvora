import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to view property contact details.' }, { status: 401 });

  const { id } = await params;
  const property = db.getPropertyById(id);
  if (!property || property.status !== 'published') {
    return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
  }

  const isOwner = property.ownerId === session.user.id;
  const isAdmin = session.user.role === 'admin';
  const isUnlocked = session.user.role === 'buyer' &&
    db.getContactUnlocks().some((unlock) => unlock.propertyId === id && unlock.buyerId === session.user.id);
  if (!isOwner && !isAdmin && !isUnlocked) {
    return NextResponse.json({ success: true, unlocked: false });
  }

  const owner = db.getUserById(property.ownerId);
  if (!owner) {
    return NextResponse.json({ success: false, error: 'Property owner contact is unavailable.' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    unlocked: true,
    contact: { fullName: owner.fullName, phone: owner.phone, email: owner.email },
  });
}
