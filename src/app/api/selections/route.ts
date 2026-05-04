import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';
import type { SelectionFormData } from '@/types/selection';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const mealId = req.nextUrl.searchParams.get('mealId');
    if (userId) {
      return NextResponse.json(await repo.listSelectionsByUserId(userId));
    }
    if (mealId) {
      return NextResponse.json(await repo.listSelectionsByMealId(mealId));
    }
    return NextResponse.json(await repo.listSelections());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SelectionFormData;
    if (!body.user_id || !body.meal_id || body.opted_in === undefined) {
      return NextResponse.json({ error: 'Invalid selection payload' }, { status: 400 });
    }
    const row = await repo.createSelectionRow(body);
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
