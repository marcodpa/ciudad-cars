import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { localizedRoutes } from '../lib/seo.ts';

const run = promisify(execFile);
const origin = process.argv[2] || 'http://127.0.0.1:3002';
const out = resolve('outputs/seo');
const cli = fileURLToPath(
  new URL('../node_modules/lighthouse/cli/index.js', import.meta.url),
);
await mkdir(out, { recursive: true });
const results = [];
// One audit per device at a time; separate temporary headless browser profiles.
for (const route of localizedRoutes)
  for (const language of ['es', 'en']) {
    const path = language === 'es' ? route.path : route.en;
    for (const device of ['mobile', 'desktop']) {
      const name = `${language}-${route.path === '/' ? 'inicio' : route.path.slice(1)}-${device}`;
      const outputPath = resolve(out, name);
      const args = [
        cli,
        origin + path,
        '--only-categories=seo',
        '--chrome-flags=--headless=new --disable-gpu',
        '--output=html',
        '--output=json',
        `--output-path=${outputPath}`,
        '--quiet',
      ];
      if (device === 'desktop') args.push('--preset=desktop');
      let processError;
      const started = Date.now();
      try {
        await run(process.execPath, args, {
          maxBuffer: 4 * 1024 * 1024,
          windowsHide: true,
        });
      } catch (error) {
        processError = error;
      }
      const report = JSON.parse(
        await readFile(outputPath + '.report.json', 'utf8').catch(() => {
          throw processError || Error('No Lighthouse report');
        }),
      );
      if (new Date(report.fetchTime).getTime() < started)
        throw processError || Error('Stale Lighthouse report');
      // Chrome on Windows can briefly lock its temporary profile after a complete
      // audit. Accept only that cleanup error, never an incomplete/failed audit.
      if (
        processError &&
        !/EPERM.*lighthouse\./s.test(processError.stderr || '')
      )
        throw processError;
      if (report.runtimeError)
        throw Error(`${path}: ${report.runtimeError.message}`);
      const score = report.categories.seo.score * 100;
      const failures = report.categories.seo.auditRefs
        .map((ref) => report.audits[ref.id])
        .filter((audit) => audit.score !== null && audit.score < 1)
        .map((audit) => ({
          id: audit.id,
          title: audit.title,
          details: audit.details,
        }));
      results.push({
        path,
        language,
        device,
        score,
        failures,
        report: name + '.report.html',
        lighthouseVersion: report.lighthouseVersion,
        fetchTime: report.fetchTime,
      });
      await writeFile(
        resolve(out, 'summary.json'),
        JSON.stringify({ origin, results }, null, 2) + '\n',
      );
      console.log(
        `${score}/100 ${device} ${path}${failures.length ? ': ' + failures.map((item) => item.id).join(', ') : ''}`,
      );
    }
  }
await writeFile(
  resolve(out, 'README.md'),
  `# Auditoría SEO de Ciudad Cars\n\nLighthouse ${results[0].lighthouseVersion}, compilación de producción local: ${origin}.\n\n| Página | Móvil | Escritorio |\n|---|---:|---:|\n` +
    localizedRoutes
      .flatMap((route) =>
        ['es', 'en'].map((language) => {
          const path = language === 'es' ? route.path : route.en;
          const entries = results.filter((result) => result.path === path);
          return `| ${path} | ${entries[0].score}/100 | ${entries[1].score}/100 |`;
        }),
      )
      .join('\n') +
    '\n\nEstos resultados corresponden a los controles automáticos de SEO de Lighthouse. No miden posiciones en Google ni verifican la publicación, Search Console o los Core Web Vitals de usuarios reales.\n',
);
if (results.some((result) => result.score < 100)) process.exitCode = 1;
