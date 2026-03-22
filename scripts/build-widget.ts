import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

function hasArg(name: string): boolean {
  return process.argv.slice(2).includes(name);
}

async function buildWidget(): Promise<void> {
  const startTime = Date.now();
  const watch = hasArg('--watch');

  const entry = path.resolve(process.cwd(), 'public', 'widget-src.js');
  const outfile = path.resolve(process.cwd(), 'public', 'widget.js');

  console.log(`[build:widget] Building widget${watch ? ' (watch)' : ''}...`);

  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mapmyvisitors.com';

  const buildOptions: esbuild.BuildOptions = {
    entryPoints: [entry],
    outfile,
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['chrome90', 'firefox88', 'safari14', 'edge90'],
    format: 'iife',
    platform: 'browser',
    charset: 'utf8',
    legalComments: 'none',
    logLevel: 'info',
    color: true,
    // globe.gl is loaded from CDN inside the widget code (not bundled).
    external: [],
    define: {
      'process.env.API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
  };

  try {
    if (watch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('[build:widget] Watching for changes...');
      return;
    }

    await esbuild.build(buildOptions);

    const stats = fs.statSync(outfile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const buildTimeMs = Date.now() - startTime;

    const mapPath = outfile + '.map';
    const hasMap = fs.existsSync(mapPath);

    if (stats.size > 150 * 1024) {
      console.warn(`[build:widget] WARNING: bundle size ${sizeKB} KB exceeds 150 KB`);
    }

    console.log('[build:widget] Success');
    console.log(`[build:widget] Output: ${path.relative(process.cwd(), outfile)}`);
    console.log(`[build:widget] Source map: ${hasMap ? path.relative(process.cwd(), mapPath) : 'MISSING'}`);
    console.log(`[build:widget] Size: ${sizeKB} KB`);
    console.log(`[build:widget] Time: ${buildTimeMs}ms`);

    if (!hasMap) {
      // This is a build correctness issue.
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('[build:widget] FAILED', error);
    process.exitCode = 1;
  }
}

void buildWidget();
