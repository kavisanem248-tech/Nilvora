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

  const broker = property.assignedBrokerId
    ? db.getData().brokers.find((profile) => profile.id === property.assignedBrokerId)
    : undefined;
  if (!broker) {
    return NextResponse.json({ success: false, error: 'No broker is assigned to this property.' }, { status: 404 });
  }

  const session = getRequestSession(request);
  const hasActiveSubscription = session?.user.role === 'admin' || Boolean(
    session?.user.role === 'buyer' &&
    db.getPaymentOrders().some((payment) =>
      payment.userId === session.user.id &&
      payment.purpose === 'buyer_premium' &&
      payment.status === 'successful' &&
      payment.serviceStatus === 'active' &&
      (!payment.serviceExpiresAt || new Date(payment.serviceExpiresAt) > new Date())
    )
  );

  if (!hasActiveSubscription) {
    return NextResponse.json({ success: true, subscriptionActive: false });
  }

  return NextResponse.json({
    success: true,
    subscriptionActive: true,
    broker: {
      fullName: broker.fullName,
      avatarUrl: broker.avatarUrl,
      agencyName: broker.agencyName,
      reraNumber: broker.reraNumber,
      rating: broker.rating,
      experienceYears: broker.experienceYears,
      totalDealsClosed: broker.totalDealsClosed,
    },
  });
}
