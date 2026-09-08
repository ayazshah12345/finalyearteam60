import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';
import { parseQuestionBankCSV } from '@/lib/csv-parser';

export async function POST(req: Request) {
  const auth = await authorizeRole(['FACULTY'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { csvContent } = body;
  if (!csvContent) {
    return NextResponse.json({ error: 'csvContent string is required' }, { status: 400 });
  }

  const existingQuestions = dbStore.getQuestions();
  const parseResult = parseQuestionBankCSV(csvContent, existingQuestions);

  if (parseResult.parsedQuestions.length > 0) {
    dbStore.addQuestionsBulk(parseResult.parsedQuestions);
    dbStore.logAudit({
      id: `aud_${Date.now()}`,
      userId: auth.user.id,
      userName: auth.user.name,
      role: auth.user.role,
      action: 'IMPORT_QUESTION_BANK',
      entity: 'QuestionBank',
      entityId: `bulk_${Date.now()}`,
      timestamp: new Date().toISOString(),
      details: `Imported ${parseResult.parsedQuestions.length} valid questions from CSV (${parseResult.invalidRows.length} invalid, ${parseResult.duplicateRows.length} duplicates)`
    });
  }

  return NextResponse.json({
    success: true,
    summary: {
      totalRows: parseResult.totalRows,
      importedCount: parseResult.parsedQuestions.length,
      invalidCount: parseResult.invalidRows.length,
      duplicateCount: parseResult.duplicateRows.length
    },
    validRows: parseResult.validRows,
    invalidRows: parseResult.invalidRows,
    duplicateRows: parseResult.duplicateRows
  });
}
