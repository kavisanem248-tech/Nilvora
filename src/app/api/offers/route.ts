import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';
import { OfferItem } from '@/types';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to view offers.' }, { status: 401 });
  const data = db.getData();
  const broker = data.brokers.find((profile) => profile.profileId === session.user.id);
  let offers = data.offers.filter((offer) => {
    if (session.user.role === 'admin') return true;
    if (session.user.role === 'buyer') return offer.buyerId === session.user.id;
    const property = data.properties.find((item) => item.id === offer.propertyId);
    if (session.user.role === 'seller') return property?.ownerId === session.user.id;
    if (session.user.role === 'broker') return Boolean(broker && offer.brokerId === broker.id);
    return false;
  });
  const propertyId = new URL(request.url).searchParams.get('propertyId');
  if (propertyId) offers = offers.filter((offer) => offer.propertyId === propertyId);
  const visibleOffers = session.user.role === 'admin' || session.user.role === 'buyer'
    ? offers
    : offers.map((offer) => ({ ...offer, buyerId: '', buyerName: 'NILVORA buyer', termsConditions: '' }));
  return NextResponse.json({ success: true, count: visibleOffers.length, data: visibleOffers });
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in as a buyer to submit an offer.' }, { status: 401 });
  if (session.user.role !== 'buyer') return NextResponse.json({ success: false, error: 'Only buyer accounts can submit offers.' }, { status: 403 });

  try {
    const body = await request.json();
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId : '';
    const property = db.getPropertyById(propertyId);
    if (!property || property.status !== 'published') {
      return NextResponse.json({ success: false, error: 'Choose an available property.' }, { status: 404 });
    }
    const offerAmount = Number(body.offerAmount);
    if (!Number.isFinite(offerAmount) || offerAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Offer amount must be a positive number.' }, { status: 400 });
    }

    const offer: OfferItem = {
      id: `offer-${crypto.randomUUID()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      buyerId: session.user.id,
      buyerName: session.user.fullName,
      brokerId: property.assignedBrokerId,
      offerAmount,
      status: 'submitted',
      termsConditions: typeof body.termsConditions === 'string' ? body.termsConditions.slice(0, 1000) : '',
      createdAt: new Date().toISOString(),
    };
    db.createOffer(offer);
    db.addAuditLog({
      userId: session.user.id,
      action: 'OFFER_SUBMITTED',
      resource: 'offers',
      resourceId: offer.id,
      details: { propertyId: property.id, offerAmount },
    });
    return NextResponse.json({ success: true, message: 'Offer submitted to the property owner.', data: offer }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to submit the offer.' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to update offers.' }, { status: 401 });
  if (!['admin', 'seller', 'broker'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'This account cannot respond to offers.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const offer = typeof body.id === 'string' ? db.getOffers().find((item) => item.id === body.id) : undefined;
    if (!offer) return NextResponse.json({ success: false, error: 'Offer not found.' }, { status: 404 });
    const property = db.getPropertyById(offer.propertyId);
    const broker = db.getData().brokers.find((profile) => profile.profileId === session.user.id);
    const canManage = session.user.role === 'admin' ||
      (session.user.role === 'seller' && property?.ownerId === session.user.id) ||
      (session.user.role === 'broker' && Boolean(broker && offer.brokerId === broker.id));
    if (!canManage) return NextResponse.json({ success: false, error: 'You are not authorized to manage this offer.' }, { status: 403 });

    const status = body.status;
    if (!['countered', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Choose countered, accepted, or rejected.' }, { status: 400 });
    }
    const updates: Partial<OfferItem> = { status };
    if (status === 'countered') {
      const amount = Number(body.counterAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ success: false, error: 'A positive counter amount is required.' }, { status: 400 });
      }
      updates.counterAmount = amount;
    }

    const updated = db.updateOffer(offer.id, updates);
    db.addAuditLog({
      userId: session.user.id,
      action: `OFFER_${status.toUpperCase()}`,
      resource: 'offers',
      resourceId: offer.id,
      details: { newStatus: status, counterAmount: updates.counterAmount },
    });
    return NextResponse.json({
      success: true,
      message: `Offer marked ${status}. A deal room is not created until the parties record transaction terms.`,
      data: updated,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update the offer.' }, { status: 400 });
  }
}
