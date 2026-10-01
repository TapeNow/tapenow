# Verify a release archive

**English** · [简体中文](verify-a-release.zh-CN.md)

A TapeNow release archive contains the website files and a receipt signed with TapeNow's Ed25519 key. Checking it takes Node.js and about a minute, works offline, and does not require a TapeNow account.

## What you need

- Node.js 20.11 or later.
- The archive. In the workbench, open **Deployment details** for a release and click **Export build and receipt** (project owners). Anyone the owner sends the ZIP to can verify it.
- The verifier: `verify/verify-release.mjs` and `verify/receipt-keys.mjs` from this repository. The workbench serves the same two files at `/tools/verify-release.mjs` and `/tools/receipt-keys.mjs`. Keep them in the same folder.

## Steps

1. **Unpack the archive.** Keep `release.json`, `keys.json` and the `site/` folder together.
2. **Pin the signing key.** Read the fingerprint from [KEYS.md](../KEYS.md) and from <https://app.tapenow.dev/api/keys>. They must match. Never take the fingerprint from the archive itself; an attacker who changed the files could change that too.
3. **Get a fresh registry (recommended).** Save <https://app.tapenow.dev/api/keys> as `keys.json`, replacing the copy in the archive, so that a key revoked after the archive was made is caught.
4. **Run the verifier:**

   ```bash
   node verify/verify-release.mjs release.json keys.json <fingerprint> ./site
   ```

## Reading the result

Success prints JSON and exits with status 0:

```json
{
  "verified": true,
  "keyId": "ed25519:360c4430…",
  "legacy": false,
  "status": "current",
  "files": 12,
  "note": "…",
  "noteEn": "Proves the archive matches what this key signed. …"
}
```

- `legacy: true` means the receipt predates key IDs; it was checked against the pinned key directly.
- `status: "retired"` is fine: the key no longer signs new receipts, but receipts it signed remain valid.

Failure prints the reason in Chinese and English and exits with status 1. Common reasons:

| Message | What it means |
| --- | --- |
| `Trusted public key is missing from the registry or does not match` | The fingerprint you pinned is not in `keys.json`. Check for a typo, or refresh `keys.json`. |
| `Receipt public-key mismatch` | The receipt was signed by a different key than the one you pinned. |
| `This public key has been revoked` | Do not trust this receipt. |
| `Invalid receipt signature` | `release.json` was changed after signing. |
| `Manifest hash does not match the file list` | The file list in the receipt was edited. |
| `File does not match: <path>` | That file in `site/` differs from what was signed. |

## What it proves

A successful check proves that the files are exactly the ones the key holder signed, together with the release plan recorded in the receipt. It does not prove that a website is serving them right now, that a database is unchanged, or that anyone audited the content. Details: [release receipt specification](../spec/release-receipt.md).
