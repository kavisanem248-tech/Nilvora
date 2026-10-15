import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { getRequestSession } from '@/lib/auth/request-session';

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request);
    if (!session) return NextResponse.json({ success: false, error: 'Sign in to verify this payment.' }, { status: 401 });

    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (typeof orderId !== 'string' || typeof razorpayOrderId !== 'string' ||
      typeof razorpayPaymentId !== 'string' || typeof razorpaySignature !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory payment verification fields.' },
        { status: 400 }
      );
    }

    const paymentOrder = db.getPaymentOrders().find(
      (p) => p.id === orderId && p.razorpayOrderId === razorpayOrderId
    );

    if (!paymentOrder) {
      return NextResponse.json(
        { success: false, error: 'Payment order reference not found in database.' },
        { status: 404 }
      );
    }
    if (session.user.role !== 'admin' && paymentOrder.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'You cannot verify another account’s payment.' }, { status: 403 });
    }

    // Protect against duplicate processing (Idempotency)
    if (paymentOrder.status === 'successful') {
      return NextResponse.json({
        success: true,
        message: 'Payment was already verified and processed.',
        order: paymentOrder,
        isIdempotentReplay: true,
      });
    }

    // 2. Cryptographic HMAC SHA-256 Verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ success: false, error: 'Payment verification is not configured.' }, { status: 503 });
    const generatedSignature = crypto.createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest();
    const receivedSignature = Buffer.from(razorpaySignature, 'hex');
    const isSignatureValid = receivedSignature.length === generatedSignature.length &&
      crypto.timingSafeEqual(generatedSignature, receivedSignature);
    if (!isSignatureValid) {
      db.addAuditLog({
        userId: paymentOrder.userId,
        action: 'SECURITY_ALERT_PAYMENT_SIGNATURE_MISMATCH',
        resource: 'payment_orders',
        resourceId: paymentOrder.id,
        details: { razorpayOrderId, razorpayPaymentId },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Payment signature verification failed. Potential tampering detected.',
        },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) return NextResponse.json({ success: false, error: 'Payment provider verification is not configured.' }, { status: 503 });
    const gatewayResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`,
      },
      cache: 'no-store',
    });
    if (!gatewayResponse.ok) {
      return NextResponse.json({ success: false, error: 'The payment provider could not confirm this payment.' }, { status: 502 });
    }
    const gatewayPayment = await gatewayResponse.json() as {
      order_id?: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
    if (
      gatewayPayment.order_id !== paymentOrder.razorpayOrderId ||
      gatewayPayment.status !== 'captured' ||
      gatewayPayment.amount !== paymentOrder.amount * 100 ||
      gatewayPayment.currency !== paymentOrder.currency
    ) {
      return NextResponse.json({ success: false, error: 'The payment provider has not confirmed a captured payment matching this order.' }, { status: 400 });
    }

    const updatedOrder = db.confirmPayment(paymentOrder.id, razorpayPaymentId);
    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'This payment order cannot be completed.' }, { status: 409 });
    }

    // 4. Log Audit Event & Invoice
    db.addAuditLog({
      userId: paymentOrder.userId,
      action: 'PAYMENT_VERIFIED_SUCCESSFUL',
      resource: 'payment_orders',
      resourceId: paymentOrder.id,
      details: {
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        receiptNumber: paymentOrder.receiptNumber,
        verificationMode: 'provider_api_and_cryptographic_hmac_verified',
        razorpayPaymentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and confirmed by NILVORA accounting engine.',
      verificationMode: 'provider_api_and_cryptographic_hmac_verified',
      order: updatedOrder,
      invoice: {
        receiptNumber: paymentOrder.receiptNumber,
        totalAmount: paymentOrder.amount,
        currency: 'INR',
        gstRate: '18% IGST',
        paidAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error verifying payment.' },
      { status: 500 }
    );
  }
}
