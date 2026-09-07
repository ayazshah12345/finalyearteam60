import Papa from 'papaparse';
import { Question } from '../types';

export interface ParsedQuestionRow {
  rowNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  difficulty: string;
  subject: string;
  topic: string;
  explanation: string;
  marks: number;
  negativeMarks: number;
  timeLimitSeconds?: number;
  tags?: string[];
  isValid: boolean;
  errorReason?: string;
  isDuplicate?: boolean;
}

export interface CSVParseResult {
  totalRows: number;
  validRows: ParsedQuestionRow[];
  invalidRows: ParsedQuestionRow[];
  duplicateRows: ParsedQuestionRow[];
  parsedQuestions: Question[];
}

export function parseQuestionBankCSV(csvText: string, existingQuestions: Question[] = []): CSVParseResult {
  const parseResult = Papa.parse<any>(csvText as any, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  const validRows: ParsedQuestionRow[] = [];
  const invalidRows: ParsedQuestionRow[] = [];
  const duplicateRows: ParsedQuestionRow[] = [];
  const parsedQuestions: Question[] = [];

  const existingTextSet = new Set(existingQuestions.map(q => q.questionText.trim().toLowerCase()));
  const currentBatchTextSet = new Set<string>();

  parseResult.data.forEach((row: any, idx: number) => {
    const rowNum = idx + 2; // header is row 1
    const questionText = (row['Question'] || row['question'] || row['Question Text'] || '').trim();
    const optionA = (row['Option A'] || row['optionA'] || row['OptionA'] || '').trim();
    const optionB = (row['Option B'] || row['optionB'] || row['OptionB'] || '').trim();
    const optionC = (row['Option C'] || row['optionC'] || row['OptionC'] || '').trim();
    const optionD = (row['Option D'] || row['optionD'] || row['OptionD'] || '').trim();
    const rawAnswer = (row['Correct Answer'] || row['correctAnswer'] || row['Answer'] || '').trim().toUpperCase();
    const rawDiff = (row['Difficulty'] || row['difficulty'] || 'Medium').trim();
    const subject = (row['Subject'] || row['subject'] || 'General').trim();
    const topic = (row['Topic'] || row['topic'] || 'General').trim();
    const explanation = (row['Explanation'] || row['explanation'] || '').trim();
    const marks = parseFloat(row['Marks'] || row['marks'] || '4');
    const negativeMarks = parseFloat(row['Negative Marks'] || row['negativeMarks'] || '1');

    let isValid = true;
    let errorReason = '';
    let isDuplicate = false;

    // Row Validation
    if (!questionText) {
      isValid = false;
      errorReason = 'Missing Question text';
    } else if (!optionA) {
      isValid = false;
      errorReason = 'Option A is empty';
    } else if (!optionB) {
      isValid = false;
      errorReason = 'Option B is empty';
    } else if (!optionC) {
      isValid = false;
      errorReason = 'Option C is empty';
    } else if (!optionD) {
      isValid = false;
      errorReason = 'Option D is empty';
    } else if (!['A', 'B', 'C', 'D'].includes(rawAnswer)) {
      isValid = false;
      errorReason = `Invalid Correct Answer: "${rawAnswer}" (must be A, B, C, or D)`;
    }

    // Duplicate Check
    const lowerText = questionText.toLowerCase();
    if (isValid) {
      if (existingTextSet.has(lowerText) || currentBatchTextSet.has(lowerText)) {
        isDuplicate = true;
        isValid = false;
        errorReason = 'Duplicate question detected in system or CSV batch';
      } else {
        currentBatchTextSet.add(lowerText);
      }
    }

    let diffFormatted: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (['easy', 'medium', 'hard'].includes(rawDiff.toLowerCase())) {
      diffFormatted = (rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase()) as any;
    }

    const rowItem: ParsedQuestionRow = {
      rowNumber: rowNum,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer: rawAnswer,
      difficulty: diffFormatted,
      subject,
      topic,
      explanation,
      marks: isNaN(marks) ? 4 : marks,
      negativeMarks: isNaN(negativeMarks) ? 1 : negativeMarks,
      isValid,
      errorReason,
      isDuplicate
    };

    if (isDuplicate) {
      duplicateRows.push(rowItem);
    } else if (!isValid) {
      invalidRows.push(rowItem);
    } else {
      validRows.push(rowItem);
      parsedQuestions.push({
        id: `q_imp_${Date.now()}_${idx}`,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: rawAnswer as any,
        difficulty: diffFormatted,
        subject,
        topic,
        explanation,
        marks: isNaN(marks) ? 4 : marks,
        negativeMarks: isNaN(negativeMarks) ? 1 : negativeMarks,
        imported: true
      });
    }
  });

  return {
    totalRows: parseResult.data.length,
    validRows,
    invalidRows,
    duplicateRows,
    parsedQuestions
  };
}
