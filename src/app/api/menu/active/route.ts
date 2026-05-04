import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

export async function GET() {
  try {
    const menu = await repo.getActiveMenuWithExpiryUpdate();
    return NextResponse.json(menu);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
