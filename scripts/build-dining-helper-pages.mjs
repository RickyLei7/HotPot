import { readFile, writeFile } from 'node:fs/promises';
import { widget, homeChatEntry, chatRoutes, chatVersion } from '../assistant/widget.mjs';

for (const route of chatRoutes) {
  const target = new URL(`../public/${route ? route + '/' : ''}index.html`, import.meta.url);
  const original = await readFile(target, 'utf8');
  const language = route.startsWith('zh-hant') ? 'zh-Hant' : 'en';
  let updated = original.replace(/      <!-- dining-helper:start -->[\s\S]*?<!-- dining-helper:end -->\n/g, '');
  updated = updated.replace(/\s*<link rel="stylesheet" href="\/dining-helper\.css[^\"]*"\s*\/>/g, '');
  updated = updated.replace(/\s*<script defer src="\/dining-(?:helper|chat)\.js[^\"]*"><\/script>/g, '');
  updated = updated.replace('  </head>', `    <link rel="stylesheet" href="/dining-helper.css?v=${chatVersion}" />\n    <script defer src="/dining-helper.js?v=${chatVersion}"></script>\n    <script defer src="/dining-chat.js?v=${chatVersion}"></script>\n  </head>`);
  if (route === '' || route === 'zh-hant') {
    updated = updated.replace(/<button class="home-chat-entry"[\s\S]*?<\/button>/g, '');
    updated = updated.replace('<a class="hero-phone"', `${homeChatEntry(language)}<a class="hero-phone"`);
  }
  const anchor = '  </body>';
  if (!updated.includes(anchor)) throw new Error(`Chat insertion point missing in ${route || '/'}.`);
  updated = updated.replace(anchor, `      <!-- dining-helper:start -->\n      ${widget(language)}\n      <!-- dining-helper:end -->\n${anchor}`);
  if (process.argv.includes('--check')) {
    if (updated !== original) throw new Error(`Chat markup drift in ${route || '/'}. Run npm run build:assistant.`);
  } else await writeFile(target, updated);
}
console.log(process.argv.includes('--check') ? 'Bilingual chat markup is up to date.' : 'Generated bilingual chat markup.');
