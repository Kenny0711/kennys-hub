import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { VizResponse } from '@/lib/visualize-types';

const SYSTEM_PROMPT = `You are a LeetCode algorithm visualizer. Given a code solution, generate a step-by-step data structure visualization.

Return ONLY valid JSON — no prose, no markdown fences, no backticks. The response must be directly parseable by JSON.parse().

Rules:
1. Maximum 8 steps showing KEY algorithm moments (skip trivial setup lines)
2. Write step descriptions in Traditional Chinese (繁體中文)
3. For arrays: show ALL values, highlight active indices with colors
4. For hashmaps: show current state of the entire map at each step
5. For variables: show key loop variables (i, j, left, right, result, ans, etc.)
6. Focus on the algorithm's core logic — what changes each step
7. When analyzing C++ code, translate memory addresses, pointers (like h.end()), and iterators into logical array indices or human-readable HashMap states

Color scheme for highlights:
- "#22c55e" = current element / left pointer / active index
- "#3b82f6" = right pointer / second element / comparison target
- "#f59e0b" = result found / answer
- "#ef4444" = mismatch / element to skip

Return JSON matching this EXACT schema (no extra fields):
{
  "title": "Algorithm approach name (e.g. Two Pointers, Hash Map)",
  "steps": [
    {
      "step": 1,
      "description": "繁體中文說明這一步做了什麼",
      "structures": [
        { "type": "array", "label": "nums", "values": [2, 7, 11, 15], "highlights": [{"index": 0, "color": "#22c55e", "label": "i"}] },
        { "type": "hashmap", "label": "seen", "entries": [{"key": "2", "value": "0", "highlight": true}] },
        { "type": "variable", "name": "target", "value": 9 }
      ]
    }
  ]
}`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: '請先在 .env.local 設定 ANTHROPIC_API_KEY' },
      { status: 503 }
    );
  }

  let body: { code: string; language: string; title: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { code, language, title } = body;
  if (!code?.trim()) {
    return NextResponse.json({ error: '缺少 code 欄位' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Problem: "${title || 'LeetCode Problem'}"
Language: ${language || 'unknown'}

Code:
${code}

Generate the step-by-step data structure visualization JSON.`,
        },
      ],
    });

    const raw =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Strip any accidental markdown fences before parsing
    const clean = raw.replace(/```json\n?|```/g, '').trim();

    const vizData: VizResponse = JSON.parse(clean);

    return NextResponse.json(vizData);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[visualize] error:', message);
    return NextResponse.json(
      { error: `生成失敗：${message}` },
      { status: 500 }
    );
  }
}
