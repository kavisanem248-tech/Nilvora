import { NextRequest, NextResponse } from 'next/server';
import { randomInt, randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { getRevenueService } from '@/lib/payments/catalog';
import { PaymentOrder } from '@/types';
import { getRequestSession } from '@/lib/auth/request-session';

const GST_RATE_PERCENT = 18;
const LEGAL_SERVICE_ROLES = ['buyer', 'seller', 'broker'];

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Sign in before creating a payment order.' }, { status: 401 });
    }

    const body = await request.json();
    const itemId = typeof body.itemId === 'string' ? body.itemId : '';
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId : undefined;
    const service = getRevenueService(itemId, db.getData().settings);
    if (!service || (body.purpose !== undefined && body.purpose !== service.purpose)) {
      return NextResponse.json({ success: false, error: 'Select a valid service from the current pricing catalog.' }, { status: 400 });
    }
    const roleAllowed = service.purpose === 'legal_doc_service'
      ? LEGAL_SERVICE_ROLES.includes(session.user.role)
      : session.user.role === service.role || service.additionalRoles?.some((allowedRole) => allowedRole === session.user.role);
    if (!roleAllowed) {
      return NextResponse.json({ success: false, error: 'This account cannot purchase the requested service.' }, { status: 403 });
    }

    if (!Number.isSafeInteger(service.price) || service.price <= 0) {
      return NextResponse.json({ success: false, error: 'An administrator must configure a price for this service before it can be purchased.' }, { status: 400 });
    }

    const property = propertyId ? db.getPropertyById(propertyId) : undefined;
    if (propertyId && !service.propertyRequired) {
      return NextResponse.json({ success: false, error: 'This service does not use a property selection.' }, { status: 400 });
    }
    if (service.propertyRequired && !propertyId) {
      return NextResponse.json({ success: false, error: 'Select a property for this service.' }, { status: 400 });
    }
    if (propertyId && !property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }
    if (service.purpose === 'buyer_contact_unlock') {
      if (!property || property.status !== 'published' || property.ownerId === session.user.id) {
        return NextResponse.json({ success: false, error: 'Contact unlocks are available only for another owner’s published property.' }, { status: 403 });
      }
      if (db.getContactUnlocks().some((unlock) => unlock.buyerId === session.user.id && unlock.propertyId === property!.id)) {
        return NextResponse.json({ success: false, error: 'You already have access to this property contact.' }, { status: 409 });
      }
    } else if (service.purpose === 'seller_featured_property' || service.purpose === 'seller_reels_promotion') {
      const sellerOwnsProperty = session.user.role === 'seller' && property?.ownerId === session.user.id;
      const broker = session.user.role === 'broker'
        ? db.getData().brokers.find((profile) => profile.profileId === session.user.id)
        : undefined;
      const brokerHasAccess = session.user.role === 'broker' && broker && property?.assignedBrokerId === broker.id;
      if (!property || (!sellerOwnsProperty && !brokerHasAccess) || property.status !== 'published') {
        return NextResponse.json({ success: false, error: 'Promotions can be purchased only for your published properties.' }, { status: 403 });
      }
    } else if (propertyId && session.user.role === 'broker') {
      const broker = db.getData().brokers.find((profile) => profile.profileId === session.user.id);
      if (!broker || property?.assignedBrokerId !== broker.id || property.status !== 'published') {
        return NextResponse.json({ success: false, error: 'You may purchase a property service only for a published property assigned to your broker account.' }, { status: 403 });
      }
    }

    const gstAmount = Math.round((service.price * GST_RATE_PERCENT) / 100);
    const totalAmount = service.price + gstAmount;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isDemo = !keyId && !keySecret;
    if (!isDemo && (!keyId || !keySecret)) {
      return NextResponse.json({ success: false, error: 'Payment provider configuration is incomplete.' }, { status: 503 });
    }

    const receiptNumber = `${isDemo ? 'DEMO-' : ''}NILVORA-${new Date().getFullYear()}-${randomInt(10000, 99999)}`;
    let razorpayOrderId: string | undefined;
    if (!isDemo) {
      const gatewayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: totalAmount * 100, currency: 'INR', receipt: receiptNumber }),
        cache: 'no-store',
      });
      if (!gatewayResponse.ok) {
        return NextResponse.json({ success: false, error: 'The payment provider could not create the order.' }, { status: 502 });
      }
      const gatewayOrder = await gatewayResponse.json() as { id?: string };
      if (typeof gatewayOrder.id !== 'string') {
        return NextResponse.json({ success: false, error: 'The payment provider returned an invalid order.' }, { status: 502 });
      }
      razorpayOrderId = gatewayOrder.id;
    }

    const order: PaymentOrder = {
      id: `pay-${randomUUID()}`,
      userId: session.user.id,
      purchaserRole: session.user.role === 'buyer' || session.user.role === 'seller' || session.user.role === 'broker'
        ? session.user.role
        : undefined,
      purpose: service.purpose,
      itemId: service.id,
      propertyId,
      amount: totalAmount,
      currency: 'INR',
      status: 'created',
      isDemo,
      receiptNumber,
      razorpayOrderId,
      createdAt: new Date().toISOString(),
    };
    db.createPaymentOrder(order);
    db.addAuditLog({
      userId: session.user.id,
      action: isDemo ? 'DEMO_PAYMENT_ORDER_CREATED' : 'PAYMENT_ORDER_CREATED',
      resource: 'payment_orders',
      resourceId: order.id,
      details: {
        itemName: service.name,
        baseAmount: service.price,
        gstAmount,
        totalAmount,
        isDemo,
        propertyId,
        receiptNumber,
      },
    });

    return NextResponse.json({
      success: true,
      demo: isDemo,
      order: {
        id: order.id,
        razorpayOrderId,
        currency: order.currency,
        amountInPaisa: isDemo ? undefined : totalAmount * 100,
        baseAmount: service.price,
        gstAmount,
        totalAmount,
        itemName: service.name,
        receiptNumber,
        keyId: isDemo ? undefined : keyId,
      },
      message: isDemo
        ? 'DEMO ONLY: This is an unpaid demo order. No payment was processed and no service was activated.'
        : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error('[NILVORA PAYMENTS] Failed to create order:', error);
    return NextResponse.json({ success: false, error: 'Server error creating payment order.' }, { status: 500 });
  }
}
