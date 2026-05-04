import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

export async function GET() {
  try {
    const [
      totalUsers,
      activeMeals,
      todaySelections,
      distinctSelectingUsers,
      totalMeals,
    ] = await Promise.all([
      repo.countUsers(),
      repo.countMealsOnActiveMenus(),
      repo.countSelectionsToday(),
      repo.countDistinctSelectionUsers(),
      repo.countMeals(),
    ]);

    const participationRate =
      totalUsers === 0
        ? 0
        : Math.round((distinctSelectingUsers / totalUsers) * 100);

    return NextResponse.json({
      totalUsers,
      activeMeals,
      todaySelections,
      participationRate,
      totalMeals,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
