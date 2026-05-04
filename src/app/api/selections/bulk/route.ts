import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/db/repos';

interface BulkPayload {
  meal_id?: string;
  user_ids?: string[];
  opted_in?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BulkPayload;
    const { meal_id, user_ids, opted_in } = body;
    if (!meal_id || !Array.isArray(user_ids) || opted_in === undefined) {
      return NextResponse.json(
        { error: 'Invalid bulk selection payload' },
        { status: 400 }
      );
    }
    const result = await repo.bulkCreateSelectionsSkipExisting(
      meal_id,
      user_ids,
      opted_in
    );
    return NextResponse.json({
      created: result.created,
      createdCount: result.created.length,
      skippedUserIds: result.skippedUserIds,
      skippedCount: result.skippedUserIds.length,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
