import { readFile, writeFile } from 'node:fs/promises';
import { widget } from '../assistant/widget.mjs';

for (const route of ['menu', 'contact', 'zh-hant/menu', 'zh-hant/contact']) {
  const target = new URL(`../public/${route}/index.html`, import.meta.url);
  const original = await readFile(target, 'utf8');
  const language = route.startsWith('zh-hant/') ? 'zh-Hant' : 'en';
  let updated = original.replace(/      <!-- dining-helper:start -->[\s\S]*?<!-- dining-helper:end -->\n/g, '');
  updated = updated.replace(/\s*<link rel="stylesheet" href="\/dining-helper\.css[^\"]*"\s*\/>/g, '');
  updated = updated.replace(/\s*<script defer src="\/dining-helper\.js[^\"]*"><\/script>/g, '');
  updated = updated.replace('  </head>', '    <link rel="stylesheet" href="/dining-helper.css?v=20261029" />\n    <script defer src="/dining-helper.js?v=20261029"></script>\n  </head>');
  const anchor = route === 'menu' ? '      <section class="menu-section" id="ayce-hotpot">' : route === 'zh-hant/menu' ? '    <section class="content-section localized-section"' : '    </main>';
  if (!updated.includes(anchor)) throw new Error(`Assistant insertion point missing in ${route}.`);
  updated = updated.replace(anchor, `      <!-- dining-helper:start -->\n      ${widget(language)}\n      <!-- dining-helper:end -->\n${anchor}`);
  if (process.argv.includes('--check')) {
    if (updated !== original) throw new Error(`Assistant markup drift in ${route}. Run npm run build:assistant.`);
  } else {
    await writeFile(target, updated);
  }
}
console.log(process.argv.includes('--check') ? 'Bilingual assistant markup is up to date.' : 'Generated bilingual assistant markup.');
