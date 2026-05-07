/* eslint-disable @typescript-eslint/no-require-imports */
const esbuild = require('esbuild');
const path = require('path');

const dir = __dirname;

async function build() {
  await Promise.all([
    esbuild.build({
      entryPoints: [path.join(dir, 'src/popup.ts')],
      bundle: true,
      outfile: path.join(dir, 'dist/popup.js'),
      target: ['chrome110'],
      platform: 'browser',
    }),
    esbuild.build({
      entryPoints: [path.join(dir, 'src/content.ts')],
      bundle: true,
      outfile: path.join(dir, 'dist/content.js'),
      target: ['chrome110'],
      platform: 'browser',
    }),
    esbuild.build({
      entryPoints: [path.join(dir, 'src/main_world.ts')],
      bundle: true,
      outfile: path.join(dir, 'dist/main_world.js'),
      target: ['chrome110'],
      platform: 'browser',
    }),
  ]);
  console.log('✓ Extension built to dist/');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
