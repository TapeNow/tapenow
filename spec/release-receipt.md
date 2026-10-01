# Release receipts and the key registry

**English** · [简体中文](release-receipt.zh-CN.md)

Status: stable, as produced by the TapeNow workbench since 0.4. The reference implementation is [`verify/`](../verify/). The key words MUST, MUST NOT and SHOULD are used as in RFC 2119.

## 1. Release archive

**Export build and receipt** in the workbench downloads a ZIP archive:

```
release.json   the signed receipt (section 2)
keys.json      a copy of the key registry when the archive was made (section 4)
VERIFY.txt     a short note on how to verify
site/          the release files, byte for byte as they were archived
```

`keys.json` is a convenience copy. It comes from the same place as the receipt, so it MUST NOT be used to decide which key to trust (section 5).

## 2. Receipt

```json
{
  "payload":   { "...": "section 3" },
  "signature": "<base64 Ed25519 signature>",
  "algorithm": "Ed25519",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n",
  "trust":     "<human-readable note; not verified>"
}
```

- `signature` is an Ed25519 signature over the UTF-8 bytes of `JSON.stringify(payload)`.
- `publicKey` is the signer's key as a PEM-encoded SPKI structure.

**Serialization.** The signed bytes are exactly what JavaScript's `JSON.stringify` produces for the parsed `payload`: keys in the order they appear in `release.json`, no whitespace, non-ASCII characters left as-is, and the escapes `\"`, `\\`, `\b`, `\f`, `\n`, `\r`, `\t` and `\u00XX` for other control characters. Numbers follow ECMAScript number-to-string rules; token amounts are stored as decimal strings, so they are not affected. Implementations in other languages MUST keep key order when parsing and re-serialize with these rules, and SHOULD be tested against real archives.

## 3. Payload

| Field | Type | Meaning |
| --- | --- | --- |
| `schema` | string | `deweb-release/v1`. The name predates the TapeNow brand and is kept for compatibility. |
| `keyId` | string | `ed25519:<fingerprint>` of the signing key. Absent on early receipts. |
| `releaseId` | string | `d-` followed by 12 hexadecimal characters. |
| `projectId` | string | `p-` followed by 12 hexadecimal characters. |
| `files` | array | The file manifest (below), sorted by `path`. |
| `manifestHash` | string | SHA-256 (hex) of `JSON.stringify(files)`. |
| `issuedAt` | string | ISO 8601 UTC time the receipt was signed. |
| `kind` | string | What the receipt attests (below). |
| `source` | object or null | Where the build came from (upload, sample, GitHub build, restore). |
| `restoredFrom` | string or null | The release this one was restored from. |
| `publication`, `chain`, `transactions`, `authorizedWallet` | object, array or null | Publication and onchain details recorded at signing time. |
| `approval`, `configurationDigest`, `artifactConfiguration`, `approvedConfiguration`, `databaseContract`, `budget`, `nativeAccess` | object or null | The reviewed release plan and its configuration snapshot. |

Verifiers MUST ignore fields they do not understand; they are still covered by the signature.

Each `files` entry:

```json
{ "path": "assets/app.js", "bytes": 1024, "sha256": "<64 hex>", "contentType": "text/javascript" }
```

`path` is relative, uses `/`, and never contains `..` or a leading `/`. Entries appear with the keys in exactly this order, which matters for `manifestHash`.

`kind` values:

| `kind` | Meaning |
| --- | --- |
| `cloud-preview`, `local-preview` | Archived in the workbench; nothing published. `local-*` comes from a self-hosted development instance. |
| `cloud-restore-candidate`, `local-restore-candidate` | A restore candidate created from an earlier release; not yet published. |
| `release-approval` | Signed when the owner approved the release plan. |
| `cloud-file-verification` | Published to a hosted entry point and read back file by file. |
| `chain-file-verification` | Written onchain and read back file by file. |
| `chain-with-browser-observation` | Onchain, plus a recorded observation in a real browser. |

## 4. Key registry (`tapenow-keys/v1`)

Served at `https://app.tapenow.dev/api/keys` and `https://app.tapenow.dev/.well-known/tapenow-keys.json`.

```json
{
  "schema": "tapenow-keys/v1",
  "currentKeyId": "ed25519:<fingerprint>",
  "keys": [
    { "keyId": "ed25519:<fingerprint>", "fingerprint": "<64 hex>", "algorithm": "Ed25519",
      "publicKey": "<PEM>", "status": "current" }
  ],
  "trust": "<human-readable note>"
}
```

- `fingerprint` is the SHA-256 of the key's SPKI DER encoding, as 64 lowercase hexadecimal characters.
- `status` is `current`, `retired` (no longer signs; old receipts stay valid) or `revoked` (compromised; receipts signed with it MUST be rejected).
- Optional fields: `validFrom`, `retiredAt`, `reason`.

## 5. Verification

Inputs: the receipt, a registry, a **pinned fingerprint** obtained independently of the archive (for example from [KEYS.md](../KEYS.md) and the live registry), and the `site/` directory.

1. The pinned fingerprint MUST be 64 lowercase hexadecimal characters.
2. Find the registry entry whose `fingerprint` equals the pinned value, and recompute the fingerprint from its `publicKey`. Both MUST match.
3. Its `status` MUST be `current` or `retired`.
4. `algorithm` MUST be `Ed25519`, and the fingerprint of the receipt's `publicKey` MUST equal the pinned value.
5. If `payload.keyId` is present, it MUST equal the entry's `keyId`.
6. The signature MUST verify over `JSON.stringify(payload)` with the trusted key.
7. `files` MUST be a non-empty array, and SHA-256 of `JSON.stringify(files)` MUST equal `manifestHash`.
8. For every entry, `path` MUST be unique and relative, MUST resolve inside `site/` after following links, and the file MUST have exactly `bytes` bytes and SHA-256 `sha256`.

Extra files in `site/` that are not in the manifest do not fail verification; they are simply not covered by it.

## 6. What a valid receipt proves

A valid receipt proves that the files match what the holder of that key signed, at `issuedAt`, with the plan and status recorded in the payload. It does **not** prove that a website is online now, that it still serves these bytes, that any database is unchanged, or that anyone audited the content. To check a live Gateway site, see the [Gateway manifest](gateway-manifest.md).
