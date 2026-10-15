import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';
import { PropertyItem, ListingStatus } from '@/types';

type RouteContext = { params: Promise<{ id: string }> };

function isHttpUrl(value: unknown) {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const property = db.getPropertyById(id);
  const session = getRequestSession(request);
  const broker = session?.user.role === 'broker'
    ? db.getData().brokers.find((profile) => profile.profileId === session.user.id)
    : undefined;
  const canSeeUnpublished = Boolean(session && (
    session.user.role === 'admin' ||
    property?.ownerId === session.user.id ||
    (session.user.role === 'broker' && property?.assignedBrokerId === broker?.id)
  ));

  if (!property || (property.status !== 'published' && !canSeeUnpublished)) {
    return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
  }
  const viewedProperty = property.status === 'published'
    ? db.updateProperty(id, { viewsCount: property.viewsCount + 1 }) || property
    : property;

  const canSeePrivateDocuments = session?.user.role === 'admin' || viewedProperty.ownerId === session?.user.id;
  const currentProperty = {
    ...viewedProperty,
    isFeatured: Boolean(viewedProperty.isFeatured && (!viewedProperty.featuredUntil || new Date(viewedProperty.featuredUntil) > new Date())),
    likesCount: db.getPropertyLikeCount(id),
  };
  const result = canSeePrivateDocuments
    ? currentProperty
    : { ...currentProperty, documents: currentProperty.documents?.filter((document) => !document.isPrivate) };
  return NextResponse.json({ success: true, data: result });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to update this property.' }, { status: 401 });

  try {
    const { id } = await params;
    const property = db.getPropertyById(id);
    if (!property) return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    if (session.user.role !== 'admin' && property.ownerId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'You do not own this listing.' }, { status: 403 });
    }

    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Property updates must be an object.' }, { status: 400 });
    }
    for (const [field, maxLength] of [['title', 160], ['locality', 120], ['description', 2000]] as const) {
      if (field in body && (typeof body[field] !== 'string' || body[field].length > maxLength || (field !== 'description' && !body[field].trim()))) {
        return NextResponse.json({ success: false, error: `Invalid ${field} value.` }, { status: 400 });
      }
    }
    if ('price' in body && (!Number.isFinite(Number(body.price)) || Number(body.price) <= 0)) {
      return NextResponse.json({ success: false, error: 'Price must be a positive number.' }, { status: 400 });
    }

    const fields: (keyof PropertyItem)[] = [
      'title', 'titleTa', 'description', 'propertyType', 'listingType', 'price',
      'priceNegotiable', 'state', 'district', 'locality', 'subLocality', 'pincode',
      'surveyNumber', 'pattaNumber', 'areaSqft', 'bedrooms', 'bathrooms',
      'floorNumber', 'totalFloors', 'furnishingStatus', 'amenities', 'images',
      'reels', 'documents', 'builderProjectName',
    ];
    const updates: Partial<PropertyItem> = {};
    for (const field of fields) {
      if (field in body) Object.assign(updates, { [field]: body[field] });
    }
    if ('price' in updates) updates.price = Number(updates.price);
    if ('reels' in body) {
      if (!Array.isArray(body.reels) || body.reels.length > 50 || body.reels.some((reel: unknown) => {
        if (!reel || typeof reel !== 'object') return true;
        const item = reel as Record<string, unknown>;
        return typeof item.id !== 'string' || item.id.length > 120 ||
          item.propertyId !== id || item.mediaType !== 'video_reel' ||
          !isHttpUrl(item.url) ||
          (item.thumbnailUrl !== '' && !isHttpUrl(item.thumbnailUrl)) ||
          (item.caption !== undefined && (typeof item.caption !== 'string' || item.caption.length > 500)) ||
          (item.captionTa !== undefined && (typeof item.captionTa !== 'string' || item.captionTa.length > 500)) ||
          (item.category !== undefined && (typeof item.category !== 'string' || item.category.length > 80));
      })) {
        return NextResponse.json({ success: false, error: 'Reel metadata must include a valid video URL and belong to this property.' }, { status: 400 });
      }
    }
    if (session.user.role === 'admin') {
      if ('status' in body) {
        const statuses: ListingStatus[] = ['draft', 'under_review', 'approved', 'published', 'paused', 'sold', 'rejected'];
        if (!statuses.includes(body.status)) return NextResponse.json({ success: false, error: 'Invalid property status.' }, { status: 400 });
        updates.status = body.status;
      }
      if ('assignedBrokerId' in body && (typeof body.assignedBrokerId === 'string' || body.assignedBrokerId === undefined)) {
        updates.assignedBrokerId = body.assignedBrokerId;
      }
      if ('isFeatured' in body && typeof body.isFeatured === 'boolean') updates.isFeatured = body.isFeatured;
    } else if ('status' in body || 'assignedBrokerId' in body || 'trustScope' in body || 'trustScore' in body || 'isFeatured' in body) {
      return NextResponse.json({ success: false, error: 'Only administrators can change listing review and trust fields.' }, { status: 403 });
    }

    const updated = db.updateProperty(id, updates);
    db.addAuditLog({
      userId: session.user.id,
      action: 'PROPERTY_UPDATED',
      resource: 'properties',
      resourceId: id,
      details: { updatedFields: Object.keys(updates) },
    });
    return NextResponse.json({ success: true, message: 'Property updated successfully.', data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Error updating property.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to archive this property.' }, { status: 401 });

  try {
    const { id } = await params;
    const property = db.getPropertyById(id);
    if (!property) return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    if (session.user.role !== 'admin' && property.ownerId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'You do not have permission to archive this listing.' }, { status: 403 });
    }
    const activeDeal = db.getDealRooms().find(
      (deal) => deal.propertyId === id && deal.status !== 'closed_won' && deal.status !== 'cancelled'
    );
    if (activeDeal) {
      return NextResponse.json({ success: false, error: 'Cannot archive a property linked to an active deal room.' }, { status: 400 });
    }

    const updated = db.updateProperty(id, { status: 'paused' });
    db.addAuditLog({
      userId: session.user.id,
      action: 'PROPERTY_ARCHIVED',
      resource: 'properties',
      resourceId: id,
      details: { previousStatus: property.status, newStatus: 'paused' },
    });
    return NextResponse.json({ success: true, message: 'Property listing archived.', data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Error archiving property.' }, { status: 400 });
  }
}
