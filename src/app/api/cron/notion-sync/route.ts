import { NextRequest, NextResponse } from 'next/server';
import { drainNotionQueue, enqueueMissedAccepted, reconcileNotion } from '@/lib/notion-sync';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const recovered = await enqueueMissedAccepted();
    const pull = await reconcileNotion(50);
    const push = await drainNotionQueue(10);
    return NextResponse.json({ recovered, push, pull });
  } catch (error) {
    console.error('Notion reconciliation failed:', error);
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 });
  }
}
