import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  const items = dbStore.getPortfolioItems(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  const body = await req.json();

  const newItem = {
    id: `pf_${Date.now()}`,
    studentId: user.id,
    type: body.type || 'PROJECT',
    title: body.title,
    description: body.description,
    date: body.date || new Date().toISOString().split('T')[0],
    tags: body.tags || ['Project'],
    linkUrl: body.linkUrl,
    autoSynced: false,
    publicVisible: body.publicVisible ?? true
  };

  dbStore.addPortfolioItem(newItem);
  return NextResponse.json({ item: newItem });
}
