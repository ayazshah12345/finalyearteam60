import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';

export async function GET() {
  const auditLogs = dbStore.getAuditLogs();
  return NextResponse.json({ auditLogs });
}
