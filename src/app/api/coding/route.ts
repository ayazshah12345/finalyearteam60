import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = getAuthenticatedUser();
  const profile = dbStore.getCodingProfile(user.id);
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const user = getAuthenticatedUser();
  const body = await req.json();

  const easy = parseInt(body.easyCount || '0');
  const medium = parseInt(body.mediumCount || '0');
  const hard = parseInt(body.hardCount || '0');

  const updatedProfile = {
    id: `cp_${Date.now()}`,
    studentId: user.id,
    leetcodeUsername: body.leetcodeUsername || 'aarav_codes',
    hackerrankUsername: body.hackerrankUsername,
    codechefUsername: body.codechefUsername,
    codeforcesUsername: body.codeforcesUsername,
    geeksforgeeksUsername: body.geeksforgeeksUsername,
    totalSolved: easy + medium + hard,
    easyCount: easy,
    mediumCount: medium,
    hardCount: hard,
    contestRating: parseInt(body.contestRating || '1785'),
    streakDays: parseInt(body.streakDays || '14'),
    verificationStatus: (body.isVerified ? 'Imported / Verified' : 'Manual Entry') as any,
    lastUpdated: new Date().toISOString()
  };

  dbStore.updateCodingProfile(updatedProfile);
  return NextResponse.json({ profile: updatedProfile });
}
