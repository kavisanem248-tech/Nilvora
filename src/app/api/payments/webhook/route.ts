import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const processedEventIds = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ success: false, error: 'Payment webhook is not configured.' }, { status: 503 });
    }
    if (!signature) return NextResponse.json({ success: false, error: 'Missing webhook signature.' }, { status: 401 });

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest();
    const receivedSignature = Buffer.from(signature, 'hex');
    if (receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature.' }, { status: 401 });
    }

    let payload: {
      id?: string;
      event?: string;
      payload?: {
        payment?: { entity?: { order_id?: string; id?: string; amount?: number; currency?: string; error_description?: string } };
        refund?: { entity?: { payment_id?: string; id?: string } };
      };
    };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Malformed JSON payload.' }, { status: 400 });
    }

    if (typeof payload.id !== 'string' || typeof payload.event !== 'string') {
      return NextResponse.json({ success: false, error: 'Webhook event id and type are required.' }, { status: 400 });
    }
    if (processedEventIds.has(payload.id)) {
      return NextResponse.json({ success: true, message: 'Event already processed.' });
    }

    const payment = payload.payload?.payment?.entity;
    const paymentOrderId = payment?.order_id;
    const paymentOrder = typeof paymentOrderId === 'string'
      ? db.getPaymentOrders().find((order) => order.razorpayOrderId === paymentOrderId)
      : undefined;

    if (payload.event.startsWith('payment.') && !paymentOrder) {
      return NextResponse.json({ success: false, error: 'Payment order was not found.' }, { status: 404 });
    }

    if (payload.event === 'payment.captured') {
      if (payment?.amount !== paymentOrder!.amount * 100 || payment.currency !== paymentOrder!.currency || typeof payment.id !== 'string') {
        return NextResponse.json({ success: false, error: 'Captured payment does not match the stored order.' }, { status: 400 });
      }
      const confirmed = db.confirmPayment(paymentOrder!.id, payment.id);
      if (!confirmed) {
        return NextResponse.json({ success: false, error: 'Payment order could not be completed.' }, { status: 409 });
      }
    } else if (payload.event === 'payment.failed' && paymentOrder) {
      db.updatePaymentOrder(paymentOrder.id, { status: 'failed', razorpayPaymentId: payment?.id });
    } else if (payload.event === 'refund.processed') {
      const paymentId = payload.payload?.refund?.entity?.payment_id;
      const refundedOrder = typeof paymentId === 'string'
        ? db.getPaymentOrders().find((order) => order.razorpayPaymentId === paymentId)
        : undefined;
      if (refundedOrder) db.markPaymentRefunded(refundedOrder.id);
    }

    processedEventIds.add(payload.id);
    if (paymentOrder) {
      db.addAuditLog({
        userId: 'system',
        action: `WEBHOOK_${payload.event.toUpperCase().replaceAll('.', '_')}`,
        resource: 'payment_orders',
        resourceId: paymentOrder.id,
        details: { eventId: payload.id, paymentId: payment?.id },
      });
    }
    return NextResponse.json({ success: true, receivedEvent: payload.event });
  } catch (error) {
    console.error('[NILVORA PAYMENTS] Webhook processing failed:', error);
    return NextResponse.json({ success: false, error: 'Payment webhook processing failed.' }, { status: 500 });
  }
}
