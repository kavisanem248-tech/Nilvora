import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const property = db.getPropertyById(id);
  if (!property || property.status !== 'published') {
    return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
  }
  const session = getRequestSession(request);
  return NextResponse.json({
    success: true,
    likesCount: db.getPropertyLikeCount(id),
    liked: session?.user.role === 'buyer' && db.hasPropertyLike(session.user.id, id),
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in as a buyer to like a property.' }, { status: 401 });
  if (session.user.role !== 'buyer') return NextResponse.json({ success: false, error: 'Only buyers can like a property.' }, { status: 403 });

  const { id } = await params;
  const property = db.getPropertyById(id);
  if (!property || property.status !== 'published') {
    return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
  }
  if (property.ownerId === session.user.id) {
    return NextResponse.json({ success: false, error: 'You cannot like your own property.' }, { status: 403 });
  }

  const result = db.togglePropertyLike(session.user.id, id);
  return NextResponse.json({ success: true, ...result });
}
