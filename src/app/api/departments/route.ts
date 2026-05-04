import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    const data = q
      ? await repo.searchDepartments(q)
      : await repo.listDepartments();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name as string;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }
    const row = await repo.createDepartment(name.trim());
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
