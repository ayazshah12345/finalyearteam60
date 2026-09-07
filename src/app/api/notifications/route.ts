import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = getAuthenticatedUser();
  const notifications = dbStore.getNotifications({ userId: user.id, role: user.role });
  const unreadCount = notifications.filter(n => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id } = body;
  if (id) {
    dbStore.markNotificationRead(id);
  }
  return NextResponse.json({ success: true });
}
