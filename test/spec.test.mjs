// Consistency checks between the specifications, the docs and KEYS.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {keyFingerprint} from '../verify/receipt-keys.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('WebMCP tool schemas are well formed', () => {
  const spec = JSON.parse(read('spec/webmcp-tools.json'));
  assert.equal(spec.schema, 'tapenow-webmcp-tools/v1');
  assert.ok(spec.tools.length > 0);
  const names = new Set();
  for (const t of spec.tools) {
    assert.match(t.name, /^tapenow_[a-z_]+$/);
    assert.ok(!names.has(t.name), `duplicate ${t.name}`);
    names.add(t.name);
    assert.ok(t.description.length > 20, t.name);
    assert.equal(t.inputSchema.type, 'object');
    assert.equal(t.inputSchema.additionalProperties, false);
    for (const k of t.inputSchema.required) assert.ok(k in t.inputSchema.properties, `${t.name}: ${k}`);
    assert.equal(t.annotations.untrustedContentHint, true);
    assert.ok(!(t.annotations.readOnlyHint && t.annotations.consequentialHint), t.name);
    // An agent can never approve its own work.
    assert.ok(!('approved' in t.inputSchema.properties), t.name);
  }
});

test('the generated tool tables list every tool', () => {
  const spec = JSON.parse(read('spec/webmcp-tools.json'));
  for (const doc of ['docs/webmcp.md', 'docs/webmcp.zh-CN.md']) {
    const text = read(doc);
    for (const t of spec.tools) assert.ok(text.includes('`' + t.name + '`'), `${doc}: ${t.name}`);
  }
});

test('KEYS.md fingerprints match the published key and the README examples', () => {
  const keys = read('KEYS.md');
  const pem = keys.match(/-----BEGIN PUBLIC KEY-----[\s\S]+?-----END PUBLIC KEY-----\n/)[0];
  const current = keys.match(/`current`[^|]*\|\s*`([a-f0-9]{64})`/)[1];
  assert.equal(keyFingerprint(pem), current);
  for (const f of ['README.md', 'README.zh-CN.md']) assert.ok(read(f).includes(current), f);
});
