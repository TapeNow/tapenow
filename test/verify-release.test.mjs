// End-to-end tests for verify/verify-release.mjs: build a real signed archive in a
// temporary directory, then check that every kind of tampering is caught.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash, generateKeyPairSync, sign} from 'node:crypto';
import {keyFingerprint, keyRegistry} from '../verify/receipt-keys.mjs';

const cli = path.resolve(import.meta.dirname, '../verify/verify-release.mjs');
const sha = (data) => createHash('sha256').update(data).digest('hex');
const newKey = () => {
  const {privateKey, publicKey} = generateKeyPairSync('ed25519');
  return {privateKey, pem: publicKey.export({type: 'spki', format: 'pem'})};
};

function archive({key = newKey(), history = [], files = {'index.html': '<h1>hi</h1>', 'assets/app.js': 'console.log(1)'}, keyId = true, edit} = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tapenow-verify-'));
  const site = path.join(dir, 'site');
  const manifest = Object.keys(files).sort().map((name) => {
    fs.mkdirSync(path.dirname(path.join(site, name)), {recursive: true});
    fs.writeFileSync(path.join(site, name), files[name]);
    return {path: name, bytes: Buffer.byteLength(files[name]), sha256: sha(files[name]), contentType: 'text/plain'};
  });
  const registry = keyRegistry(key.pem, history);
  const payload = {schema: 'deweb-release/v1', ...(keyId ? {keyId: registry.currentKeyId} : {}), releaseId: 'd-0123456789ab', projectId: 'p-0123456789ab',
    manifestHash: sha(JSON.stringify(manifest)), files: manifest, issuedAt: '2026-10-01T00:00:00.000Z', kind: 'cloud-preview'};
  edit?.(payload);
  const receipt = {payload, signature: sign(null, Buffer.from(JSON.stringify(payload)), key.privateKey).toString('base64'), algorithm: 'Ed25519', publicKey: key.pem, trust: 'test'};
  fs.writeFileSync(path.join(dir, 'release.json'), JSON.stringify(receipt, null, 2));
  fs.writeFileSync(path.join(dir, 'keys.json'), JSON.stringify(registry, null, 2));
  return {dir, site, key, fingerprint: keyFingerprint(key.pem)};
}
const run = (a, fingerprint = a.fingerprint) => {
  const r = spawnSync(process.execPath, [cli, path.join(a.dir, 'release.json'), path.join(a.dir, 'keys.json'), fingerprint, a.site], {encoding: 'utf8'});
  return {code: r.status, out: r.stdout, err: r.stderr};
};
const rewrite = (a, file, change) => {
  const p = path.join(a.dir, file);
  const v = JSON.parse(fs.readFileSync(p, 'utf8'));
  change(v);
  fs.writeFileSync(p, JSON.stringify(v, null, 2));
};

test('a genuine archive verifies against the pinned key', () => {
  const a = archive();
  const r = run(a);
  assert.equal(r.code, 0, r.err);
  const out = JSON.parse(r.out);
  assert.equal(out.verified, true);
  assert.equal(out.files, 2);
  assert.equal(out.status, 'current');
  assert.equal(out.keyId, 'ed25519:' + a.fingerprint);
  assert.equal(out.legacy, false);
});

test('receipts without keyId still verify against a pinned key', () => {
  const r = run(archive({keyId: false}));
  assert.equal(r.code, 0, r.err);
  assert.equal(JSON.parse(r.out).legacy, true);
});

test('a changed site file fails and names the file', () => {
  const a = archive();
  fs.writeFileSync(path.join(a.site, 'assets/app.js'), 'console.log(2)');
  const r = run(a);
  assert.equal(r.code, 1);
  assert.match(r.err, /File does not match: assets\/app\.js/);
});

test('a missing site file fails', () => {
  const a = archive();
  fs.rmSync(path.join(a.site, 'index.html'));
  assert.equal(run(a).code, 1);
});

test('an edited payload breaks the signature', () => {
  const a = archive();
  rewrite(a, 'release.json', (v) => { v.payload.kind = 'chain-file-verification'; });
  const r = run(a);
  assert.equal(r.code, 1);
  assert.match(r.err, /Invalid receipt signature/);
});

test('an edited file list breaks the manifest hash even when re-signed by the same key', () => {
  const key = newKey();
  const a = archive({key, edit: (p) => { p.files[0].bytes += 1; }});
  const r = run(a);
  assert.equal(r.code, 1);
  assert.match(r.err, /Manifest hash does not match/);
});

test('a receipt signed by another key fails even if that key is in the bundled registry', () => {
  const trusted = archive();
  const attacker = archive();
  // The attacker ships their own keys.json; the verifier only trusts the pinned fingerprint.
  const r = run(attacker, trusted.fingerprint);
  assert.equal(r.code, 1);
  assert.match(r.err, /Trusted public key is missing/);
});

test('a malformed fingerprint is refused', () => {
  const a = archive();
  assert.match(run(a, 'not-a-fingerprint').err, /independently confirmed SHA-256/);
});

test('revoked keys are rejected and retired keys still verify old receipts', () => {
  const old = newKey();
  const revoked = archive({key: old});
  const current = newKey();
  const registry = (status) => keyRegistry(current.pem, [{publicKey: old.pem, status}]);
  fs.writeFileSync(path.join(revoked.dir, 'keys.json'), JSON.stringify(registry('revoked')));
  assert.match(run(revoked).err, /revoked/);
  fs.writeFileSync(path.join(revoked.dir, 'keys.json'), JSON.stringify(registry('retired')));
  const r = run(revoked);
  assert.equal(r.code, 0, r.err);
  assert.equal(JSON.parse(r.out).status, 'retired');
});

test('manifest paths cannot escape the site directory', () => {
  const key = newKey();
  for (const bad of ['../release.json', '/etc/hosts']) {
    const a = archive({key, edit: (p) => {
      p.files = [{path: bad, bytes: 1, sha256: '0'.repeat(64), contentType: 'text/plain'}];
      p.manifestHash = sha(JSON.stringify(p.files));
    }});
    assert.equal(run(a).code, 1, bad);
  }
});

test('usage is printed in both languages', () => {
  const r = spawnSync(process.execPath, [cli, '--help'], {encoding: 'utf8'});
  assert.equal(r.status, 0);
  assert.match(r.stdout, /用法 \/ Usage/);
});
