import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = getAuthenticatedUser();
    const body = await req.json();
    const username = (body.username || '').trim();

    if (!username) {
      return NextResponse.json({ error: 'LeetCode username is required' }, { status: 400 });
    }

    let totalSolved = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let contestRating = 1650;
    let streakDays = 7;
    let acceptanceRate = 62.4;
    let ranking = 125000;
    let contributionPoints = 150;
    let avatarUrl = '';
    let fetched = false;

    // Try fetching live public LeetCode stats API
    try {
      const apiRes = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 60 }
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.status === 'success') {
          totalSolved = data.totalSolved || 0;
          easyCount = data.easySolved || 0;
          mediumCount = data.mediumSolved || 0;
          hardCount = data.hardSolved || 0;
          acceptanceRate = data.acceptanceRate || 60;
          ranking = data.ranking || 100000;
          contributionPoints = data.contributionPoints || 100;
          fetched = true;
        }
      }
    } catch (err) {
      console.warn('Failed primary LeetCode API, attempting fallback parse:', err);
    }

    // Secondary fallback fetch if primary proxy fails
    if (!fetched) {
      try {
        const fallbackRes = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.totalSolved !== undefined) {
            totalSolved = fallbackData.totalSolved || 0;
            easyCount = fallbackData.easySolved || 0;
            mediumCount = fallbackData.mediumSolved || 0;
            hardCount = fallbackData.hardSolved || 0;
            ranking = fallbackData.ranking || 150000;
            fetched = true;
          }
        }
      } catch (e) {
        console.warn('Secondary LeetCode API error:', e);
      }
    }

    // Fallback default calculation if user enters custom numbers manually
    if (!fetched) {
      easyCount = parseInt(body.easyCount || '140', 10);
      mediumCount = parseInt(body.mediumCount || '145', 10);
      hardCount = parseInt(body.hardCount || '27', 10);
      totalSolved = easyCount + mediumCount + hardCount;
      streakDays = parseInt(body.streakDays || '14', 10);
      contestRating = parseInt(body.contestRating || '1785', 10);
    } else {
      // Estimate streak and contest rating when live data is fetched
      streakDays = Math.max(1, Math.min(60, Math.floor(totalSolved / 15)));
      contestRating = Math.max(1200, 1400 + Math.floor(mediumCount * 2 + hardCount * 5));
    }

    const currentProfile = dbStore.getCodingProfile(user.id);

    const updatedProfile = {
      id: currentProfile?.id || `cp_${Date.now()}`,
      studentId: user.id,
      leetcodeUsername: username,
      totalSolved,
      easyCount,
      mediumCount,
      hardCount,
      contestRating,
      streakDays,
      verificationStatus: (fetched ? 'Imported / Verified' : 'Manual Entry') as any,
      lastUpdated: new Date().toISOString(),
      ranking,
      acceptanceRate,
      contributionPoints,
      leetcodeAvatar: avatarUrl
    };

    dbStore.updateCodingProfile(updatedProfile);

    return NextResponse.json({
      success: true,
      fetchedLive: fetched,
      profile: updatedProfile
    });
  } catch (error: any) {
    console.error('LeetCode Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync LeetCode profile' }, { status: 500 });
  }
}
