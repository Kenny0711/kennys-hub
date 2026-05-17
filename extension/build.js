/* eslint-disable @typescript-eslint/no-require-imports */
const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const dir = __dirname;

async function buildFile(input, output) {
  const source = await fs.readFile(path.join(dir, input), 'utf8');
  const result = await esbuild.transform(source, {
    loader: 'ts',
    target: ['chrome110'],
    format: 'iife',
  });

  const outfile = path.join(dir, output);
  await fs.mkdir(path.dirname(outfile), { recursive: true });
  await fs.writeFile(outfile, result.code);
}

async function build() {
  await Promise.all([
    buildFile('src/popup.ts', 'dist/popup.js'),
    buildFile('src/background.ts', 'dist/background.js'),
    buildFile('src/content.ts', 'dist/content.js'),
    buildFile('src/main_world.ts', 'dist/main_world.js'),
  ]);
  console.log('Extension built to dist/');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
