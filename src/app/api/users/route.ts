import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search');
    const department = req.nextUrl.searchParams.get('department');
    if (search) {
      return NextResponse.json(await repo.searchUsersByName(search));
    }
    if (department) {
      return NextResponse.json(await repo.listUsersByDepartment(department));
    }
    return NextResponse.json(await repo.listUsers());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name as string;
    const department = body.department as string;
    if (!name?.trim() || !department) {
      return NextResponse.json(
        { error: 'name and department required' },
        { status: 400 }
      );
    }
    const row = await repo.createUser(name.trim(), department);
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
