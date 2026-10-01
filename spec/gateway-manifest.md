# Gateway manifest (`tapenow-gateway/v1`)

**English** · [简体中文](gateway-manifest.zh-CN.md)

Status: stable since 0.7. The reference client is [`sdk/tapenow-gateway.mjs`](../sdk/tapenow-gateway.mjs).

TapeNow Gateway serves a website whose files were published onchain (BSC, X Layer or Base) over ordinary HTTPS. Every Gateway site exposes the snapshot it serves at:

```
https://<gateway-host>/__tapenow/manifest.json
```

Gateway hosts:

- `gw-p-<project>.tapenow.dev` — stable address of a project. It redirects (307) to the current version host.
- `gw-v-<first 48 hex characters of versionId>.tapenow.dev` — one pinned version. Its content never changes.
- A customer domain that the project owner connected and verified.

## Manifest

```json
{
  "schema": "tapenow-gateway/v1",
  "projectId": "p-<12 hex>",
  "releaseId": "d-<12 hex>",
  "target": { "chainId": 8453, "cpuIndex": "2", "tokenId": "12", "cpu": "<address>", "container": "<address>" },
  "blockNumber": 51906414,
  "blockHash": "0x<64 hex>",
  "files": [ { "path": "index.html", "bytes": 464, "sha256": "<64 hex>", "contentType": "text/html" } ],
  "fallback": "index.html",
  "manifestHash": "<64 hex>",
  "versionId": "<64 hex>",
  "checkedAt": "2026-09-28T13:29:46.647Z",
  "paidUntil": "2026-10-28T13:13:23.000Z",
  "nativeUrl": "https://<tape-name>.tapekit.org/",
  "verification": "two-rpc-snapshot",
  "mode": "pinned",
  "health": { "status": "active", "checkedAt": "…", "leaseUntil": 0, "paidUntil": 0 }
}
```

| Field | Meaning |
| --- | --- |
| `target.chainId` | `56` (BSC), `196` (X Layer) or `8453` (Base). |
| `target.cpuIndex`, `target.tokenId` | The TapeKit processor and chip that hold the site, as decimal strings. |
| `target.cpu`, `target.container` | The processor contract and the chip's container account (checksummed addresses). |
| `blockNumber`, `blockHash` | The block at which ownership and activation were checked. Two independent RPC providers had to agree on it (`verification: "two-rpc-snapshot"`). |
| `files`, `manifestHash` | The file manifest and its hash, computed exactly as in [release receipts](release-receipt.md#3-payload). |
| `fallback` | The file served for paths that are not in `files` (single-page apps). |
| `versionId` | Identifier of this snapshot (below). |
| `checkedAt`, `paidUntil` | When the snapshot was taken, and until when the chip's TapeKit activation is paid. |
| `nativeUrl` | The same site served directly by TapeKit, under the chip's `.tape` name. |
| `health` | Live status added by the server when you request the manifest. It is not part of `versionId`. |

### `versionId`

`versionId` is the SHA-256 (hex) of the canonical JSON of these nine fields:

```
schema, projectId, releaseId, target, blockNumber, blockHash, files, fallback, manifestHash
```

Canonical JSON here means `JSON.stringify` after sorting object keys alphabetically at every level (array order is kept) and dropping keys whose value is `undefined`. The server refuses to serve a snapshot whose stored manifest does not hash to its `versionId`.

## Checking a Gateway site

1. Fetch the manifest over HTTPS with redirects disabled, and check `schema` and `target.chainId`.
2. Recompute `manifestHash` from `files` and `versionId` from the nine fields.
3. Fetch each file you care about from the **same origin** and compare its length and SHA-256 with `files`. `verifyGatewayFile` in the SDK does this.
4. To tie the site to a signed release, compare `releaseId` and `manifestHash` with a [release receipt](release-receipt.md) that you verified with a pinned key.

The manifest itself is not signed. What it gives you is a precise statement you can check: the files' hashes, the chain block they were checked against, and a hash that links them to a signed receipt. Reading the onchain data yourself at `blockNumber` (or opening `nativeUrl`) removes the need to trust the Gateway server at all.

Response headers on every Gateway file: `X-TapeNow-Project`, `X-TapeNow-Chain`, `X-TapeNow-Version` (the `versionId`), `X-TapeNow-Verification` (`pinned`, or `stale` when the latest re-check could not complete) and `X-TapeNow-Checked-At`.
