import { NextRequest, NextResponse } from 'next/server';
import { AIProviderService } from '@/lib/ai/providers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { config } = body;

    if (!config || !config.provider) {
      return NextResponse.json({ error: 'AI provider configuration is required' }, { status: 400 });
    }

    const result = await AIProviderService.testConnection(config);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
