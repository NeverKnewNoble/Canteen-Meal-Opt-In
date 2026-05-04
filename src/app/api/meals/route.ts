import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';
import type { MealFormData } from '@/types/meal';

export async function GET(req: NextRequest) {
  try {
    const menuId = req.nextUrl.searchParams.get('menuId');
    const search = req.nextUrl.searchParams.get('search');
    if (search) {
      return NextResponse.json(await repo.searchMealsByName(search));
    }
    if (menuId) {
      return NextResponse.json(await repo.listMealsByMenuId(menuId));
    }
    return NextResponse.json(await repo.listMeals());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MealFormData;
    if (!body.name || body.description === undefined || !body.menu_id) {
      return NextResponse.json({ error: 'Invalid meal payload' }, { status: 400 });
    }
    const row = await repo.createMealRow(body);
    return NextResponse.json(row);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
