import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Sign in to view notifications.' }, { status: 401 });
  }

  const userId = session.user.id;
  let notifs = db.getData().notifications.filter((notification) => notification.userId === userId);

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
    db.getData().notifications = [...db.getData().notifications, ...notifs];
  }

  return NextResponse.json({
    success: true,
    count: notifs.length,
    data: notifs,
  });
}

export async function PATCH(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Sign in to update notifications.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      db.getData().notifications = db.getData().notifications.map((notification) =>
        notification.userId === session.user.id ? { ...notification, isRead: true } : notification
      );
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const notif = db.getData().notifications.find((notification) =>
      notification.id === id && notification.userId === session.user.id
    );
    if (notif) {
      notif.isRead = true;
    }

    return NextResponse.json({ success: true, message: 'Notification marked as read.', data: notif });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error updating notifications' }, { status: 500 });
  }
}
