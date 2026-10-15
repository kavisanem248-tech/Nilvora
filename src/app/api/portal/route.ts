import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Sign in to view your portal.' }, { status: 401 });
  }

  const { user } = session;
  const brokerProfile = user.role === 'broker'
    ? db.syncBrokerSubscription(user.id)
    : db.getData().brokers.find((broker) => broker.profileId === user.id);
  let properties = db.getProperties();
  let leads = db.getLeads();

  if (user.role === 'seller') {
    properties = properties.filter((property) => property.ownerId === user.id);
    const ownPropertyIds = new Set(properties.map((property) => property.id));
    leads = leads.filter((lead) => lead.propertyId && ownPropertyIds.has(lead.propertyId));
  } else if (user.role === 'broker') {
    properties = brokerProfile
      ? properties.filter((property) =>
          property.assignedBrokerId === brokerProfile.id && property.status === 'published'
        )
      : [];
    leads = brokerProfile ? db.getLeads(brokerProfile.id) : [];
  } else if (user.role !== 'admin') {
    properties = properties.filter((property) => property.status === 'published');
    leads = [];
  }
  properties = properties.map((property) => {
    const withLikes = {
      ...property,
      isFeatured: Boolean(property.isFeatured && (!property.featuredUntil || new Date(property.featuredUntil) > new Date())),
      likesCount: db.getPropertyLikeCount(property.id),
    };
    return user.role === 'admin' || property.ownerId === user.id
      ? withLikes
      : { ...withLikes, documents: withLikes.documents?.filter((document) => !document.isPrivate) };
  });

  const safeLeads = user.role === 'admin' ? leads : leads.map((lead) => ({
    id: lead.id,
    brokerId: lead.brokerId,
    buyerId: lead.buyerId,
    propertyId: lead.propertyId,
    budgetMin: lead.budgetMin,
    budgetMax: lead.budgetMax,
    preferredLocality: lead.preferredLocality,
    propertyTypePreference: lead.propertyTypePreference,
    status: lead.status,
    priority: lead.priority,
    nextFollowUp: lead.nextFollowUp,
    createdAt: lead.createdAt,
  }));
  const appointments = user.role === 'broker' && brokerProfile
    ? db.getAppointments({ brokerId: brokerProfile.id }).map((appointment) => ({
        id: appointment.id,
        leadId: appointment.leadId,
        propertyId: appointment.propertyId,
        propertyTitle: appointment.propertyTitle,
        brokerId: appointment.brokerId,
        scheduledTime: appointment.scheduledTime,
        status: appointment.status,
        notes: appointment.notes,
      }))
    : user.role === 'admin'
      ? db.getAppointments()
      : [];
  const commissions = user.role === 'broker' && brokerProfile
    ? db.getCommissions().filter((commission) => commission.brokerId === brokerProfile.id)
    : user.role === 'admin'
      ? db.getCommissions()
      : [];

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    properties,
    leads: safeLeads,
    payments: db.getPaymentOrders().filter((payment) => user.role === 'admin' || payment.userId === user.id),
    appointments,
    commissions,
    contactUnlocks: db.getContactUnlocks()
      .filter((unlock) => user.role === 'admin' || (user.role === 'buyer' && unlock.buyerId === user.id))
      .map(({ id, propertyId, unlockedAt }) => ({ id, propertyId, unlockedAt })),
  });
}
