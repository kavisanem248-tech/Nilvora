import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { canAccessDealRoom } from '@/lib/auth/rbac';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '') || request.headers.get('x-nilvora-token');
  const session = getSession(token);

  const dealRoom = db.getDealRoomById(id);
  if (!dealRoom) {
    return NextResponse.json({ success: false, error: 'Deal Room not found.' }, { status: 404 });
  }

  // Permission Guard: Only Buyer, Seller, Assigned Broker, or Admin can access
  if (session && !canAccessDealRoom(session.user.id, session.user.role, dealRoom)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: You are not an authorized participant in this Deal Room.' },
      { status: 403 }
    );
  }

  // Calculate platform revenue vs broker commission split
  const platformFeeAmount = Math.round((dealRoom.commissionAmount * 10) / 100);
  const netBrokerAmount = dealRoom.commissionAmount - platformFeeAmount;

  return NextResponse.json({
    success: true,
    data: dealRoom,
    accounting: {
      totalPropertyValue: dealRoom.agreedPrice,
      grossCommission: dealRoom.commissionAmount,
      commissionPercentage: dealRoom.commissionPercentage,
      platformFeePercent: 10.0,
      platformRevenue: platformFeeAmount,
      netBrokerPayout: netBrokerAmount,
      currency: 'INR',
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '') || request.headers.get('x-nilvora-token');
    const session = getSession(token);

    const dealRoom = db.getDealRoomById(id);
    if (!dealRoom) {
      return NextResponse.json({ success: false, error: 'Deal Room not found.' }, { status: 404 });
    }

    if (session && !canAccessDealRoom(session.user.id, session.user.role, dealRoom)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You are not authorized to modify milestones in this Deal Room.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { milestoneId, isCompleted, tokenPaid, status } = body;

    let updatedMilestones = dealRoom.milestones;

    if (milestoneId !== undefined) {
      updatedMilestones = dealRoom.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              isCompleted: Boolean(isCompleted),
              completedAt: Boolean(isCompleted) ? new Date().toISOString() : undefined,
            }
          : m
      );
    }

    const updates: any = {};
    if (milestoneId !== undefined) updates.milestones = updatedMilestones;
    if (tokenPaid !== undefined) updates.tokenPaid = Boolean(tokenPaid);
    if (status !== undefined) updates.status = status;

    const updated = db.updateDealRoom(id, updates);

    db.addAuditLog({
      userId: session?.user.id || 'deal_room_actor',
      action: 'DEAL_ROOM_MILESTONE_UPDATED',
      resource: 'deal_rooms',
      resourceId: id,
      details: { milestoneId, isCompleted, tokenPaid, status },
    });

    return NextResponse.json({
      success: true,
      message: 'Deal Room milestone updated.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error updating deal room.' }, { status: 500 });
  }
}
