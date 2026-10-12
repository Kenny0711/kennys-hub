import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(root, 'src/data/problem-lists/starter-lists.ts');
const output = path.join(root, 'src/data/problem-lists/starter-slugs.json');
const source = ts.createSourceFile(input, await readFile(input, 'utf8'), ts.ScriptTarget.Latest, true);
const ids = new Set();

function visit(node) {
  if (ts.isArrayLiteralExpression(node) && node.elements.length === 2 &&
      ts.isStringLiteral(node.elements[0]) && /^\d+$/.test(node.elements[0].text) &&
      ts.isStringLiteral(node.elements[1])) {
    ids.add(node.elements[0].text);
  }
  ts.forEachChild(node, visit);
}
visit(source);

const response = await fetch('https://raw.githubusercontent.com/Zanger67/leetcode-question-data/master/data/leetcode.json');
if (!response.ok) throw new Error(`Problem metadata request failed: ${response.status}`);
const metadata = await response.json();
const available = new Map(metadata.data.problemsetQuestionList.questions.map(
  (problem) => [problem.frontendQuestionId, problem.titleSlug],
));
const missing = [...ids].filter((id) => !available.has(id));
if (missing.length) throw new Error(`Missing title slugs for: ${missing.join(', ')}`);

const slugs = Object.fromEntries([...ids].sort((a, b) => Number(a) - Number(b)).map(
  (id) => [id, available.get(id)],
));
await writeFile(output, `${JSON.stringify(slugs, null, 2)}\n`);
console.log(`Wrote ${ids.size} verified problem slugs to ${path.relative(root, output)}`);
