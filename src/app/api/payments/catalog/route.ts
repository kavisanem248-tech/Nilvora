import { connection, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRevenueCatalog } from '@/lib/payments/catalog';

export async function GET() {
  await connection();
  return NextResponse.json({
    success: true,
    services: getRevenueCatalog(db.getData().settings),
    paymentMode: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'live' : 'demo',
  });
}
