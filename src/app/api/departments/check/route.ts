import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get('name');
    const excludeId = req.nextUrl.searchParams.get('excludeId') ?? undefined;
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }
    const exists = await repo.checkDepartmentExists(name, excludeId);
    return NextResponse.json({ exists });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
