import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';
import type { MenuFormData } from '@/types/menu';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const row = await repo.getMenuById(id);
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
    const body = (await req.json()) as Partial<MenuFormData> & {
      todays_special?: string | null;
    };

    let result = await repo.getMenuById(id);
    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { todays_special, ...menuPatch } = body;
    const patchKeys = Object.keys(menuPatch).filter(
      (k) => (menuPatch as Record<string, unknown>)[k] !== undefined
    );
    if (patchKeys.length > 0) {
      result = await repo.updateMenuRow(id, menuPatch);
    }
    if (todays_special !== undefined) {
      result = await repo.setMenuTodaysSpecial(
        id,
        todays_special === null ? null : String(todays_special)
      );
    }
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    await repo.deleteMenuRow(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
