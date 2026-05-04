import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';
import type { MenuFormData } from '@/types/menu';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const search = sp.get('search');
    const status = sp.get('status');
    const startDate = sp.get('startDate');
    const endDate = sp.get('endDate');
    if (search) {
      return NextResponse.json(await repo.searchMenus(search));
    }
    if (status) {
      return NextResponse.json(await repo.listMenusByStatus(status));
    }
    if (startDate && endDate) {
      return NextResponse.json(
        await repo.listMenusByDateRange(startDate, endDate)
      );
    }
    return NextResponse.json(await repo.listMenus());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MenuFormData;
    if (!body.name || !body.date || !body.deadline || !body.status) {
      return NextResponse.json({ error: 'Invalid menu payload' }, { status: 400 });
    }
    const row = await repo.createMenu(body);
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
