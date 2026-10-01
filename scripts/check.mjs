// Repository checks. No dependencies: node scripts/check.mjs
// - every relative link in Markdown resolves
// - every English guide or spec has a Chinese partner (x.md ↔ x.zh-CN.md)
// - no email addresses, IP addresses or credential-shaped strings in tracked text
// - the verifier uses only built-in Node.js modules
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const skip = new Set(['.git', 'node_modules']);
const walk = (dir) => fs.readdirSync(dir, {withFileTypes: true}).flatMap((e) =>
  skip.has(e.name) ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const files = walk(root).map((f) => path.relative(root, f).split(path.sep).join('/'));
const problems = [];

for (const name of files.filter((f) => f.endsWith('.md'))) {
  const text = fs.readFileSync(path.join(root, name), 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const m of text.matchAll(/\]\(([^)\s]+)\)|(?:src|srcset|href)="([^"]+)"/g)) {
    const url = m[1] || m[2];
    if (!url || /^(https?:|mailto:|#)/.test(url)) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), url.split('#')[0]));
    if (!files.includes(target) && !files.some((f) => f.startsWith(target.replace(/\/$/, '') + '/'))) problems.push(`${name}: broken link ${url}`);
  }
}
for (const name of files.filter((f) => /^(docs|spec)\/[^/]+\.md$/.test(f) || /^(README|CHANGELOG)\.md$/.test(f))) {
  const zh = name.endsWith('.zh-CN.md') ? null : name.replace(/\.md$/, '.zh-CN.md');
  if (zh && !files.includes(zh)) problems.push(`${name}: missing Chinese version ${zh}`);
  if (name.endsWith('.zh-CN.md') && !files.includes(name.replace('.zh-CN.md', '.md'))) problems.push(`${name}: missing English version`);
}
const credentials = [/gh[opsu]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{40,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\./, /sb_(?:secret|publishable)_[A-Za-z0-9_-]{10,}/, /AKIA[0-9A-Z]{16}/, /sk-[A-Za-z0-9_-]{20,}/];
for (const name of files.filter((f) => !/\.(png|jpe?g|gif|webp|ico|woff2?)$/i.test(f) && f !== 'LICENSE')) {
  const text = fs.readFileSync(path.join(root, name), 'utf8');
  for (const [m] of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) problems.push(`${name}: email address ${m}`);
  for (const [m] of text.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)) if (!['127.0.0.1', '0.0.0.0'].includes(m)) problems.push(`${name}: IP address ${m}`);
  for (const re of credentials) if (re.test(text)) problems.push(`${name}: looks like a credential (${re.source.slice(0, 20)}…)`);
}
for (const name of files.filter((f) => f.startsWith('verify/') && f.endsWith('.mjs'))) {
  const text = fs.readFileSync(path.join(root, name), 'utf8');
  for (const [, spec] of text.matchAll(/from\s+'([^']+)'/g)) if (!spec.startsWith('node:') && !spec.startsWith('./')) problems.push(`${name}: non-built-in import ${spec}`);
  if (/\bfetch\(|node:https?|node:net/.test(text)) problems.push(`${name}: the verifier must not use the network`);
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: ${files.length} files; links, language pairs and hygiene checks pass.`);
