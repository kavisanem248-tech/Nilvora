import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';
import { getRevenueCatalog, REVENUE_SERVICES } from '@/lib/payments/catalog';
import { isProviderOrder, isProviderPayment } from '@/lib/payments/razorpay';
import { LeadStatus, ListingStatus, UserRole } from '@/types';

function requireAdmin(request: NextRequest) {
  const session = getRequestSession(request);
  return session?.user.role === 'admin' ? session : null;
}

export async function GET(request: NextRequest) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Admin access is required.' }, { status: 403 });
  }

  const data = db.getData();
  const payments = data.paymentOrders;
  const revenuePayments = payments.filter((payment) =>
    payment.status === 'successful' &&
    !payment.isDemo &&
    isProviderOrder(payment.razorpayOrderId) &&
    isProviderPayment(payment.razorpayPaymentId)
  );
  const thisMonth = new Date();
  const monthlyRevenuePayments = revenuePayments.filter((payment) => {
    const createdAt = new Date(payment.paidAt || payment.createdAt);
    return createdAt.getFullYear() === thisMonth.getFullYear() && createdAt.getMonth() === thisMonth.getMonth();
  });
  const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 5 + index, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const revenue = revenuePayments.reduce((total, payment) => {
      const paidAt = new Date(payment.paidAt || payment.createdAt);
      return paidAt.getFullYear() === year && paidAt.getMonth() === month
        ? total + payment.amount
        : total;
    }, 0);
    return {
      key,
      label: monthDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      revenue,
    };
  });
  const revenueByRole = Object.fromEntries(['buyer', 'seller', 'broker'].map((role) => [
    role,
    revenuePayments
      .filter((payment) => (payment.purchaserRole || data.users.find((user) => user.id === payment.userId)?.role) === role)
      .reduce((total, payment) => total + payment.amount, 0),
  ]));
  const revenueByService = Object.fromEntries(REVENUE_SERVICES.map((service) => [
    service.id,
    revenuePayments.filter((payment) => payment.itemId === service.id).reduce((total, payment) => total + payment.amount, 0),
  ]));
  const users = data.users.map((user) => ({
    id: user.id,
    authUserId: user.authUserId,
    fullName: user.fullName,
    displayName: user.displayName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    state: user.state,
    district: user.district,
    locality: user.locality,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  }));
  return NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    user: {
      id: session.user.id,
      fullName: session.user.fullName,
      email: session.user.email,
      phone: session.user.phone,
      role: session.user.role,
    },
    metrics: {
      buyers: data.users.filter((user) => user.role === 'buyer').length,
      sellers: data.users.filter((user) => user.role === 'seller').length,
      brokers: data.users.filter((user) => user.role === 'broker').length,
      properties: data.properties.length,
      pendingApprovals: data.properties.filter((property) => property.status === 'under_review').length,
      reels: data.properties.reduce((total, property) => total + property.reels.length, 0),
      enquiries: data.leads.length,
      payments: payments.length,
      totalRevenue: revenuePayments.reduce((total, payment) => total + payment.amount, 0),
      monthlyRevenue: monthlyRevenuePayments.reduce((total, payment) => total + payment.amount, 0),
      transactions: payments.length,
      demoOrders: payments.filter((payment) => payment.isDemo).length,
    },
    users,
    properties: data.properties,
    leads: data.leads,
    appointments: data.appointments,
    payments,
    revenueByRole,
    revenueByService,
    revenueByMonth,
    services: getRevenueCatalog(data.settings),
    commissions: data.commissionLedger,
    auditLogs: data.auditLogs,
    settings: data.settings,
    contactUnlocks: data.contactUnlocks,
  });
}

export async function PATCH(request: NextRequest) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Admin access is required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    let resourceId = '';
    let resource: string;
    let action: string;

    if (body.action === 'property_status') {
      const allowedStatuses: ListingStatus[] = ['under_review', 'published', 'paused', 'rejected'];
      if (typeof body.propertyId !== 'string' || !allowedStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'A property and valid review status are required.' }, { status: 400 });
      }
      const updated = db.updateProperty(body.propertyId, { status: body.status });
      if (!updated) return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
      resource = 'properties';
      resourceId = updated.id;
      action = 'ADMIN_PROPERTY_STATUS_UPDATED';
    } else if (body.action === 'user_role') {
      const allowedRoles: UserRole[] = ['buyer', 'seller', 'broker', 'builder', 'legal_pro'];
      if (typeof body.userId !== 'string' || !allowedRoles.includes(body.role)) {
        return NextResponse.json({ success: false, error: 'A user and valid non-admin role are required.' }, { status: 400 });
      }
      const updated = db.updateUser(body.userId, { role: body.role });
      if (!updated) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
      resource = 'users';
      resourceId = updated.id;
      action = 'ADMIN_USER_ROLE_UPDATED';
    } else if (body.action === 'lead_status') {
      const allowedStatuses: LeadStatus[] = [
        'new', 'contacted', 'qualified', 'property_suggested', 'visit_scheduled',
        'visit_completed', 'negotiation', 'agreement_prep', 'won', 'lost',
      ];
      if (typeof body.leadId !== 'string' || !allowedStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'An enquiry and valid status are required.' }, { status: 400 });
      }
      const updated = db.updateLead(body.leadId, { status: body.status });
      if (!updated) return NextResponse.json({ success: false, error: 'Enquiry not found.' }, { status: 404 });
      resource = 'leads';
      resourceId = updated.id;
      action = 'ADMIN_LEAD_STATUS_UPDATED';
    } else if (body.action === 'remove_reel') {
      if (typeof body.propertyId !== 'string' || typeof body.reelId !== 'string') {
        return NextResponse.json({ success: false, error: 'A property and reel are required.' }, { status: 400 });
      }
      const property = db.getPropertyById(body.propertyId);
      if (!property) return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
      const updated = db.updateProperty(property.id, {
        reels: property.reels.filter((reel) => reel.id !== body.reelId),
      });
      if (updated?.reels.length === property.reels.length) {
        return NextResponse.json({ success: false, error: 'Reel not found.' }, { status: 404 });
      }
      resource = 'property_reels';
      resourceId = body.reelId;
      action = 'ADMIN_REEL_REMOVED';
    } else if (body.action === 'setting') {
      if (typeof body.key !== 'string' || !/^[a-zA-Z0-9_.-]{1,80}$/.test(body.key) || typeof body.value !== 'string' || body.value.length > 1000) {
        return NextResponse.json({ success: false, error: 'A valid setting key and value are required.' }, { status: 400 });
      }
      db.setSetting(body.key, body.value);
      resource = 'settings';
      resourceId = body.key;
      action = 'ADMIN_SETTING_UPDATED';
    } else if (body.action === 'service_price') {
      const service = REVENUE_SERVICES.find((item) => item.id === body.serviceId);
      const price = Number(body.price);
      if (!service || !Number.isSafeInteger(price) || price < 0 || price > 1000000) {
        return NextResponse.json({ success: false, error: 'Choose a catalog service and a whole-number price from ₹0 to ₹10,00,000.' }, { status: 400 });
      }
      const key = `revenue.price.${service.id}`;
      db.setSetting(key, String(price));
      resource = 'settings';
      resourceId = key;
      action = 'ADMIN_REVENUE_PRICE_UPDATED';
    } else if (body.action === 'revoke_service') {
      if (typeof body.paymentId !== 'string') {
        return NextResponse.json({ success: false, error: 'A payment record is required.' }, { status: 400 });
      }
      const updated = db.revokePaymentService(body.paymentId);
      if (!updated) return NextResponse.json({ success: false, error: 'Only active services backed by a verified payment can be revoked.' }, { status: 400 });
      resource = 'payment_orders';
      resourceId = updated.id;
      action = 'ADMIN_PAID_SERVICE_REVOKED';
    } else if (body.action === 'broker_verification') {
      if (typeof body.paymentId !== 'string' || typeof body.approved !== 'boolean') {
        return NextResponse.json({ success: false, error: 'A verification request and approval decision are required.' }, { status: 400 });
      }
      const updated = db.reviewBrokerVerification(body.paymentId, body.approved);
      if (!updated) return NextResponse.json({ success: false, error: 'A pending paid broker verification request was not found.' }, { status: 404 });
      resource = 'payment_orders';
      resourceId = updated.id;
      action = body.approved ? 'ADMIN_BROKER_VERIFICATION_APPROVED' : 'ADMIN_BROKER_VERIFICATION_REJECTED';
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported admin action.' }, { status: 400 });
    }

    db.addAuditLog({
      userId: session.user.id,
      action,
      resource,
      resourceId,
      details: { action: body.action },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to apply the requested admin change.' }, { status: 400 });
  }
}
