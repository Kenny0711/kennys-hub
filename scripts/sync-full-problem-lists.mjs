import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'src/data/problem-lists/full-lists.json');
const preview = process.argv.includes('--dry-run');
const useCache = process.argv.includes('--cache');
const cacheDir = path.join(tmpdir(), 'kenny-lingshen-list-sources');

const lists = [
  ['sliding-window', '滑動窗口與雙指針', '3578981', 270],
  ['binary-search', '二分算法', 'SqopEo', 130],
  ['monotonic-stack', '單調棧', '9oZFK9', 60],
  ['grid-graph', '網格圖', 'YiXPXW', 70],
  ['bit-manipulation', '位運算', 'dHn9Vk', 120],
  ['graph-theory', '圖論算法', '01LUak', 175],
  ['dynamic-programming', '動態規劃', 'tXLS3i', 600],
  ['data-structures', '常用資料結構', 'mOr1u6', 550],
  ['math', '數學算法', 'IYT3ss', 320],
  ['greedy', '貪心算法', 'g6KTKL', 520],
  ['linked-list-tree', '鏈表、樹與回溯', 'K0n2gO', 420],
  ['strings', '字串算法', 'SJFwQI', 75],
];

function problemUrl(link) {
  try {
    const url = new URL(link);
    const target = url.hostname === 'leetcode.cn' && url.pathname === '/link/'
      ? new URL(url.searchParams.get('target'))
      : url;
    if (!['leetcode.cn', 'www.leetcode.cn'].includes(target.hostname)) return null;
    const slug = target.pathname.match(/^\/problems\/([^/]+)(?:\/|$)/)?.[1];
    return slug ? `https://leetcode.cn/problems/${slug}/` : null;
  } catch {
    return null;
  }
}

function parseProblem(line) {
  const item = line.match(/^\s*(?:[*+-]|\d+[.)])\s+(.+)$/);
  if (!item) return null;
  const link = item[1].match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
  if (!link) return null;
  const url = problemUrl(link[2]);
  if (!url) return null;
  const titleMatch = link[1].match(/^(.+?)\.\s+(.+)$/);
  if (!titleMatch) return /^\d|^LC[PRS]\s+\d|^面试题\s+\d/.test(link[1])
    ? { skipped: line.trim() }
    : null;
  if (!/^(?:\d+|LC[PRS]\s+\d+|面试题\s+\d+(?:\.\d+)?|[a-z]+-\d+(?:\.\d+)?)$/.test(titleMatch[1])) {
    return { skipped: line.trim() };
  }
  const trailing = item[1].slice(link[0].length);
  const score = trailing.match(/^\s*(\d{3,4})(?=\s|$)/)?.[1];
  return {
    id: titleMatch[1],
    title: titleMatch[2].trim(),
    url,
    ...(score ? { difficultyScore: Number(score) } : {}),
    ...(/会员题|會員題|premium/i.test(trailing) ? { premium: true } : {}),
    ...(/选做|選做/.test(trailing) ? { optional: true } : {}),
  };
}

function parseList(markdown, id, title, sourceUrl) {
  const sections = [];
  const stack = [];
  const skipped = [];
  let sectionNumber = 0;
  let inCode = false;

  function addSection(level, heading) {
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    const section = {
      id: `s${++sectionNumber}`,
      title: heading,
      ...(/选做|選做/.test(heading) ? { optional: true } : {}),
      sections: [],
      problems: [],
    };
    const parent = stack.at(-1)?.section;
    (parent ? parent.sections : sections).push(section);
    stack.push({ level, section });
    return section;
  }

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const label = heading[2].trim();
      if (/^(?:算法题单|关联题单|相關題單)/.test(label)) break;
      if (/^(?:前言|答疑|⚠|思考$)/.test(label)) continue;
      addSection(heading[1].length, label);
      continue;
    }

    const problem = parseProblem(line);
    if (!problem) continue;
    if ('skipped' in problem) {
      skipped.push(problem.skipped);
      continue;
    }
    const current = stack.at(-1)?.section ?? addSection(2, id === 'strings' ? '一、KMP' : '入門');
    if (!current.problems.some((entry) => entry.id === problem.id)) current.problems.push(problem);
  }

  function prune(items) {
    return items.flatMap((item) => {
      const children = prune(item.sections);
      if (!item.problems.length && !children.length) return [];
      return [{
        id: item.id,
        title: item.title,
        ...(item.optional ? { optional: true } : {}),
        ...(children.length ? { sections: children } : {}),
        ...(item.problems.length ? { problems: item.problems } : {}),
      }];
    });
  }

  const result = {
    id,
    title: `靈神｜${title}`,
    author: '靈茶山艾府',
    sourceUrl,
    description: '依原題單章節編排，涵蓋基礎、進階與延伸題。',
    sections: prune(sections),
    initialCompleted: [],
  };
  const entries = [...markdown.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)]
    .filter((match) => problemUrl(match[1])).length;
  const problemIds = new Set();
  function collect(items) {
    for (const section of items) {
      for (const problem of section.problems ?? []) problemIds.add(problem.id);
      collect(section.sections ?? []);
    }
  }
  collect(result.sections);
  return { result, entries, problemIds, skipped };
}

async function readSource(postId) {
  const sourceUrl = `https://leetcode.cn/discuss/post/${postId}/`;
  const proxyUrl = `https://r.jina.ai/${sourceUrl}`;
  const cachePath = path.join(cacheDir, `${postId}.md`);
  if (useCache) {
    try {
      return { markdown: await readFile(cachePath, 'utf8'), sourceUrl };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const markdown = text.split('Markdown Content:')[1];
      if (!markdown) throw new Error('Missing article content');
      if (useCache) {
        await mkdir(cacheDir, { recursive: true });
        await writeFile(cachePath, markdown);
      }
      return { markdown, sourceUrl };
    } catch (error) {
      if (attempt === 5) throw new Error(`${sourceUrl}: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 10000));
    }
  }
}

const generated = [];
for (const [id, title, postId, minimum] of lists) {
  const { markdown, sourceUrl } = await readSource(postId);
  const { result, entries, problemIds, skipped } = parseList(markdown, id, title, sourceUrl);
  if (problemIds.size < minimum) {
    throw new Error(`${id}: only ${problemIds.size} distinct problems; expected at least ${minimum}`);
  }
  if (skipped.length) {
    throw new Error(`${id}: unparsed problem links:\n${skipped.slice(0, 10).join('\n')}`);
  }
  console.log(`${id}: ${problemIds.size} distinct, ${entries} problem links, ${result.sections.length} chapters`);
  generated.push(result);
}

if (!preview) {
  await writeFile(output, `${JSON.stringify(generated, null, 2)}\n`);
  console.log(`Wrote ${output}`);
}
