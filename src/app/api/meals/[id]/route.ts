import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';
import type { MealFormData } from '@/types/meal';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const row = await repo.getMealById(id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as Partial<MealFormData>;
    const row = await repo.updateMealRow(id, body);
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    await repo.deleteMealRow(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
