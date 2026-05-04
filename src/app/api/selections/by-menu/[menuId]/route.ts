import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

type Ctx = { params: Promise<{ menuId: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const { menuId } = await context.params;
    const rows = await repo.listSelectionsByMenuIdJoined(menuId);
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
