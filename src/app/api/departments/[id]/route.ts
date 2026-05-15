import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const row = await repo.getDepartmentById(id);
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
    const body = await req.json();
    const name = body.name as string;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }
    const row = await repo.updateDepartment(id, name.trim());
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    await repo.deleteDepartment(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === '23503') {
      return NextResponse.json(
        { error: 'Cannot delete: users are assigned to this department. Reassign or remove them first.' },
        { status: 409 }
      );
    }
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
