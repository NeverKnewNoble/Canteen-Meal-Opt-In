import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

/** Body: { rows: { name: string; departmentId: string; rowNumber: number }[] } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = body.rows as {
      name: string;
      departmentId: string;
      rowNumber: number;
    }[];
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'rows array required' }, { status: 400 });
    }
    const errors = await repo.bulkInsertUsers(rows);
    return NextResponse.json({ errors });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
