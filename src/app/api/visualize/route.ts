import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { VizResponse } from '@/lib/visualize-types';

const SYSTEM_PROMPT = `You are a LeetCode algorithm visualizer. Given a code solution, generate a step-by-step data structure visualization.

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
- "#ef4444" = mismatch / element to skip`;

// Mirrors VizResponse in @/lib/visualize-types; enforced server-side via structured outputs.
const HIGHLIGHT_COLOR = { type: 'string', enum: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'] };

const VIZ_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Algorithm approach name, e.g. Two Pointers, Hash Map' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'integer' },
          description: { type: 'string', description: '繁體中文說明這一步做了什麼' },
          structures: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    type: { const: 'array' },
                    label: { type: 'string' },
                    values: { type: 'array', items: { type: ['string', 'number', 'null'] } },
                    highlights: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          index: { type: 'integer' },
                          color: HIGHLIGHT_COLOR,
                          label: { type: 'string' },
                        },
                        required: ['index', 'color'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['type', 'label', 'values', 'highlights'],
                  additionalProperties: false,
                },
                {
                  type: 'object',
                  properties: {
                    type: { const: 'hashmap' },
                    label: { type: 'string' },
                    entries: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          key: { type: 'string' },
                          value: { type: 'string' },
                          highlight: { type: 'boolean' },
                        },
                        required: ['key', 'value'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['type', 'label', 'entries'],
                  additionalProperties: false,
                },
                {
                  type: 'object',
                  properties: {
                    type: { const: 'variable' },
                    name: { type: 'string' },
                    value: { type: ['string', 'number'] },
                  },
                  required: ['type', 'name', 'value'],
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        required: ['step', 'description', 'structures'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'steps'],
  additionalProperties: false,
};

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
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: VIZ_SCHEMA } },
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

    // A refused or truncated response may not match the schema
    if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
      return NextResponse.json(
        { error: `生成失敗：${response.stop_reason}` },
        { status: 502 }
      );
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    const vizData: VizResponse = JSON.parse(textBlock?.text ?? '');

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
