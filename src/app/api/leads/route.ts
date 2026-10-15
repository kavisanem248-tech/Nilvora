import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';
import { LeadItem, LeadStatus } from '@/types';

function redactContact(lead: LeadItem): LeadItem {
  return { ...lead, buyerName: 'NILVORA buyer', buyerPhone: '', buyerEmail: undefined, notes: '' };
}

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to view enquiries.' }, { status: 401 });

  const role = session.user.role;
  if (!['buyer', 'seller', 'broker', 'admin'].includes(role)) {
    return NextResponse.json({ success: false, error: 'This account cannot access enquiries.' }, { status: 403 });
  }

  const data = db.getData();
  const ownPropertyIds = data.properties
    .filter((property) => property.ownerId === session.user.id)
    .map((property) => property.id);
  const broker = data.brokers.find((profile) => profile.profileId === session.user.id);
  const brokerIds = broker ? [broker.id] : [];

  let results = data.leads.filter((lead) => {
    if (role === 'admin') return true;
    if (role === 'buyer') return lead.buyerId === session.user.id;
    if (role === 'seller') return Boolean(lead.propertyId && ownPropertyIds.includes(lead.propertyId));
    return brokerIds.includes(lead.brokerId);
  });

  const status = new URL(request.url).searchParams.get('status');
  if (status) results = results.filter((lead) => lead.status === status);

  const visible = role === 'admin' || role === 'buyer' ? results : results.map(redactContact);
  return NextResponse.json({ success: true, count: visible.length, data: visible });
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in as a buyer to send an enquiry.' }, { status: 401 });
  if (session.user.role !== 'buyer') {
    return NextResponse.json({ success: false, error: 'Only buyer accounts can create enquiries.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const property = typeof body.propertyId === 'string' ? db.getPropertyById(body.propertyId) : undefined;
    const locality = property?.locality || (typeof body.preferredLocality === 'string' ? body.preferredLocality.trim() : '');

    if (!locality || (body.propertyId && (!property || property.status !== 'published'))) {
      return NextResponse.json({ success: false, error: 'Choose an available property or enter a preferred locality.' }, { status: 400 });
    }

    const budgetMin = body.budgetMin === undefined ? 0 : Number(body.budgetMin);
    const budgetMax = body.budgetMax === undefined ? 0 : Number(body.budgetMax);
    if (!Number.isFinite(budgetMin) || !Number.isFinite(budgetMax) || budgetMin < 0 || budgetMax < 0) {
      return NextResponse.json({ success: false, error: 'Budget values must be valid non-negative numbers.' }, { status: 400 });
    }

    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      brokerId: property?.assignedBrokerId || '',
      buyerId: session.user.id,
      propertyId: property?.id,
      buyerName: session.user.fullName,
      buyerPhone: session.user.phone,
      buyerEmail: session.user.email || undefined,
      budgetMin,
      budgetMax,
      preferredLocality: locality,
      propertyTypePreference: property?.propertyType || String(body.propertyTypePreference || ''),
      status: 'new',
      priority: 'medium',
      notes: typeof body.notes === 'string' ? body.notes.slice(0, 1000) : '',
      createdAt: new Date().toISOString(),
    };

    db.createLead(newLead);
    db.addAuditLog({
      userId: session.user.id,
      action: 'LEAD_GENERATED',
      resource: 'leads',
      resourceId: newLead.id,
      details: { propertyId: newLead.propertyId, locality: newLead.preferredLocality },
    });

    return NextResponse.json({ success: true, message: 'Your enquiry was submitted.', data: newLead }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create the enquiry.' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to update enquiries.' }, { status: 401 });
  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only administrators can update enquiry status.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const statuses: LeadStatus[] = [
      'new', 'contacted', 'qualified', 'property_suggested', 'visit_scheduled',
      'visit_completed', 'negotiation', 'agreement_prep', 'won', 'lost',
    ];
    if (typeof body.id !== 'string' || !statuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: 'An enquiry and valid status are required.' }, { status: 400 });
    }

    const updated = db.updateLead(body.id, {
      status: body.status,
      ...(typeof body.notes === 'string' ? { notes: body.notes.slice(0, 1000) } : {}),
    });
    if (!updated) return NextResponse.json({ success: false, error: 'Enquiry not found.' }, { status: 404 });

    db.addAuditLog({
      userId: session.user.id,
      action: 'LEAD_STATUS_TRANSITION',
      resource: 'leads',
      resourceId: updated.id,
      details: { newStatus: body.status },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to update the enquiry.' }, { status: 400 });
  }
}
