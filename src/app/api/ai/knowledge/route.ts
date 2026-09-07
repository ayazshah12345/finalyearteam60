import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function GET() {
  const sources = dbStore.getKnowledgeSources();
  return NextResponse.json({ sources });
}

export async function POST(req: Request) {
  const auth = authorizeRole(['FACULTY']);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { title, sourceType, content, courseTitle } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  // Chunk content into paragraphs
  const rawChunks = content.split('\n\n').filter((t: string) => t.trim().length > 0);
  const chunks = rawChunks.map((text: string, idx: number) => ({
    id: `chk_${Date.now()}_${idx}`,
    text: text.trim()
  }));

  const newSource = {
    id: `ks_${Date.now()}`,
    title,
    sourceType: sourceType || 'Notes',
    department: auth.user.department,
    courseTitle: courseTitle || 'General',
    uploadedBy: auth.user.name,
    chunkCount: chunks.length,
    content,
    chunks,
    createdAt: new Date().toISOString()
  };

  dbStore.addKnowledgeSource(newSource);
  dbStore.logAudit({
    id: `aud_${Date.now()}`,
    userId: auth.user.id,
    userName: auth.user.name,
    role: auth.user.role,
    action: 'UPLOAD_RAG_KNOWLEDGE',
    entity: 'AIKnowledgeSource',
    entityId: newSource.id,
    timestamp: new Date().toISOString(),
    details: `Uploaded ${sourceType} knowledge source "${title}" with ${chunks.length} vectorized chunks`
  });

  return NextResponse.json({ source: newSource });
}
