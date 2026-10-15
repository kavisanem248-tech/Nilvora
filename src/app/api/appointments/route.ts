import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';
import { AppointmentItem } from '@/types';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to view appointments.' }, { status: 401 });

  const data = db.getData();
  const broker = data.brokers.find((profile) => profile.profileId === session.user.id);
  const ownedPropertyIds = data.properties.filter((property) => property.ownerId === session.user.id).map((property) => property.id);
  let appointments = data.appointments.filter((appointment) => {
    if (session.user.role === 'admin') return true;
    if (session.user.role === 'buyer') return appointment.buyerId === session.user.id;
    if (session.user.role === 'seller') return ownedPropertyIds.includes(appointment.propertyId);
    if (session.user.role === 'broker') return Boolean(broker && appointment.brokerId === broker.id);
    return false;
  });
  const propertyId = new URL(request.url).searchParams.get('propertyId');
  if (propertyId) appointments = appointments.filter((appointment) => appointment.propertyId === propertyId);

  const results = ['admin', 'buyer'].includes(session.user.role)
    ? appointments
    : appointments.map((appointment) => ({
        ...appointment,
        buyerId: undefined,
        buyerName: 'NILVORA buyer',
        buyerPhone: '',
        notes: '',
      }));
  return NextResponse.json({ success: true, count: results.length, data: results });
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in as a buyer to request a site visit.' }, { status: 401 });
  if (session.user.role !== 'buyer') {
    return NextResponse.json({ success: false, error: 'Only buyer accounts can request site visits.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId : '';
    const property = db.getPropertyById(propertyId);
    const scheduledAt = typeof body.scheduledTime === 'string' ? Date.parse(body.scheduledTime) : Number.NaN;
    if (!property || property.status !== 'published') {
      return NextResponse.json({ success: false, error: 'Choose an available property.' }, { status: 400 });
    }
    if (!Number.isFinite(scheduledAt) || scheduledAt <= Date.now()) {
      return NextResponse.json({ success: false, error: 'Choose a future date and time for the visit.' }, { status: 400 });
    }

    const duplicate = db.getAppointments({ propertyId }).some(
      (appointment) => appointment.scheduledTime === new Date(scheduledAt).toISOString() && appointment.status !== 'cancelled'
    );
    if (duplicate) {
      return NextResponse.json({ success: false, error: 'That property already has a visit request at this time.' }, { status: 409 });
    }

    const newAppointment: AppointmentItem = {
      id: `appt-${crypto.randomUUID()}`,
      buyerId: session.user.id,
      propertyId: property.id,
      propertyTitle: property.title,
      brokerId: property.assignedBrokerId || '',
      buyerName: session.user.fullName,
      buyerPhone: session.user.phone,
      scheduledTime: new Date(scheduledAt).toISOString(),
      status: 'requested',
      notes: typeof body.notes === 'string' ? body.notes.slice(0, 500) : undefined,
    };
    db.createAppointment(newAppointment);
    db.addAuditLog({
      userId: session.user.id,
      action: 'SITE_VISIT_REQUESTED',
      resource: 'appointments',
      resourceId: newAppointment.id,
      details: { propertyId: property.id, time: newAppointment.scheduledTime },
    });

    return NextResponse.json({ success: true, message: 'Site visit request sent for confirmation.', data: newAppointment }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to request the site visit.' }, { status: 400 });
  }
}
