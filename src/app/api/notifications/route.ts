import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '') || request.headers.get('x-nilvora-token');
  const session = getSession(token);

  const userId = session?.user.id || 'user-default-1';
  let notifs = db.getData().notifications;

  if (notifs.length === 0) {
    // Populate default seed notifications if empty
    notifs = [
      {
        id: 'n1',
        userId,
        type: 'visit',
        title: 'Site Visit Confirmed by Broker',
        message: 'Broker Senthil Kumaran confirmed your physical inspection of Gated 3 BHK Luxury Villa for Saturday at 11:00 AM.',
        isRead: false,
        priority: 'high',
        linkUrl: '/dashboard/buyer',
        createdAt: '25 mins ago',
      },
      {
        id: 'n2',
        userId,
        type: 'offer',
        title: 'Counter-Offer Received in Deal Room',
        message: 'Seller Jayaraman accepted token conditions and countered with ₹1.12 Cr for the Ambattur Villa.',
        isRead: false,
        priority: 'urgent',
        linkUrl: '/deal-room/deal-1',
        createdAt: '2 hours ago',
      },
      {
        id: 'n3',
        userId,
        type: 'compliance',
        title: 'Patta & 30-Year EC Audit Cleared',
        message: 'Adv. Sivasankaran marked legal audit complete for Survey No. 412/1B2 with Nil encumbrances.',
        isRead: true,
        priority: 'high',
        linkUrl: '/property/prop-1',
        createdAt: 'Yesterday',
      },
    ];
    db.getData().notifications = notifs;
  }

  return NextResponse.json({
    success: true,
    count: notifs.length,
    data: notifs,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      db.getData().notifications = db.getData().notifications.map((n) => ({ ...n, isRead: true }));
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const notif = db.getData().notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
    }

    return NextResponse.json({ success: true, message: 'Notification marked as read.', data: notif });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error updating notifications' }, { status: 500 });
  }
}
