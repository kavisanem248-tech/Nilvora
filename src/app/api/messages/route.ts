import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestSession } from '@/lib/auth/request-session';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to view messages.' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  let messages = session.user.role === 'admin'
    ? db.getData().messages
    : db.getData().messages.filter((message) => message.senderId === session.user.id);
  if (conversationId) {
    messages = messages.filter((m) => m.conversationId === conversationId);
  }

  return NextResponse.json({
    success: true,
    count: messages.length,
    data: messages,
  });
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Sign in to send messages.' }, { status: 401 });

  try {
    const body = await request.json();
    const { conversationId, content, attachmentUrl } = body;

    if (typeof conversationId !== 'string' || !conversationId || typeof content !== 'string' || !content.trim() || content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'A conversationId and message content of up to 5,000 characters are required.' },
        { status: 400 }
      );
    }

    if (attachmentUrl !== undefined && (typeof attachmentUrl !== 'string' || !/^https?:\/\//i.test(attachmentUrl))) {
      return NextResponse.json({ success: false, error: 'Attachments must use an HTTP or HTTPS URL.' }, { status: 400 });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: session.user.id,
      senderName: session.user.fullName,
      senderRole: session.user.role,
      content: content.trim(),
      attachmentUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    db.getData().messages.push(newMessage);

    db.addAuditLog({
      userId: newMessage.senderId,
      action: 'MESSAGE_SENT',
      resource: 'conversations',
      resourceId: conversationId,
      details: { hasAttachment: Boolean(attachmentUrl) },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Message delivered and logged.',
        data: newMessage,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Error sending message.' }, { status: 400 });
  }
}
