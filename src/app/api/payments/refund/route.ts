import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';
import { isProviderOrder, isProviderPayment } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Admin sign-in is required to refund payments.' }, { status: 401 });
  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only administrators can authorize refunds.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    if (!orderId) return NextResponse.json({ success: false, error: 'orderId is required.' }, { status: 400 });

    const order = db.getPaymentOrders().find((payment) => payment.id === orderId || payment.razorpayOrderId === orderId);
    if (!order) return NextResponse.json({ success: false, error: 'Payment order not found.' }, { status: 404 });
    if (order.status !== 'successful' || !isProviderOrder(order.razorpayOrderId) ||
      typeof order.razorpayPaymentId !== 'string' || !isProviderPayment(order.razorpayPaymentId)) {
      return NextResponse.json({ success: false, error: 'Only captured payments can be refunded.' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, error: 'Payment processing is not configured.' }, { status: 503 });
    }
    const paymentId = order.razorpayPaymentId;
    const gatewayResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(typeof body.reason === 'string' ? { notes: { reason: body.reason.slice(0, 500) } } : {}),
      cache: 'no-store',
    });
    if (!gatewayResponse.ok) {
      return NextResponse.json({ success: false, error: 'The payment provider did not accept the refund.' }, { status: 502 });
    }
    const refund = await gatewayResponse.json() as { id?: string };
    if (typeof refund.id !== 'string') {
      return NextResponse.json({ success: false, error: 'The payment provider returned an invalid refund record.' }, { status: 502 });
    }

    const updated = db.updatePaymentOrder(order.id, { status: 'processing' });
    db.addAuditLog({
      userId: session.user.id,
      action: 'PAYMENT_REFUND_REQUESTED',
      resource: 'payment_orders',
      resourceId: order.id,
      details: { amount: order.amount, receiptNumber: order.receiptNumber, reason: body.reason, refundId: refund.id },
    });
    return NextResponse.json({ success: true, message: 'Refund request accepted; the transaction will show refunded after provider confirmation.', order: updated, refundId: refund.id });
  } catch (error) {
    console.error('[NILVORA PAYMENTS] Refund request failed:', error);
    return NextResponse.json({ success: false, error: 'Refund processing error.' }, { status: 400 });
  }
}
