# Browser SDKs

**English** · [简体中文](sdk.zh-CN.md)

Two small ES modules with no dependencies. The workbench serves them at `https://app.tapenow.dev/sdk/`; the copies in [`sdk/`](../sdk/) are identical.

## `tapenow-webmcp.mjs`: call WebMCP tools

A same-document helper for agents and automation running **inside the signed-in workbench page**. It is not a remote MCP client and never installs a fake `modelContext` when the browser has none.

| Function | Description |
| --- | --- |
| `discover(context = document.modelContext)` | Returns the registered tools whose name starts with `tapenow_` and, when the page has an origin, whose `origin` matches it. Throws `Native WebMCP unavailable` if the browser has no WebMCP. |
| `call(name, args = {}, context = document.modelContext)` | Calls one tool and returns its decoded result. The first call per context probes the argument format (object or JSON string) with the read-only `tapenow_context` tool, so a consequential tool is never sent twice. Throws `Sign in and rediscover current TapeNow tools` if the tool is not registered. |

```js
const sdk = await import('/sdk/tapenow-webmcp.mjs');
const context = await sdk.call('tapenow_context');
await sdk.call('tapenow_create_project', {name: 'Demo', requestId: crypto.randomUUID()});
```

Tool names, inputs and annotations: [webmcp.md](webmcp.md) and [spec/webmcp-tools.json](../spec/webmcp-tools.json).

## `tapenow-gateway.mjs`: check and manage Gateway sites

### Public checks (any origin)

| Function | Description |
| --- | --- |
| `readGatewayManifest(url, {fetcher})` | Fetches `/__tapenow/manifest.json` from the site over HTTPS without following redirects, and checks the schema (`tapenow-gateway/v1`) and chain (56, 196 or 8453). |
| `verifyGatewayFile(url, file, {fetcher})` | Fetches one manifest entry from the same origin and checks its length and SHA-256. Rejects unsafe paths such as `../x` or absolute paths. Returns `{verified, bytes, sha256}`. |

```js
import {readGatewayManifest, verifyGatewayFile} from './sdk/tapenow-gateway.mjs';
const site = 'https://gw-p-d0b1c8d85355.tapenow.dev';
const manifest = await readGatewayManifest(site);
for (const file of manifest.files) await verifyGatewayFile(site, file);
```

See the [Gateway manifest specification](../spec/gateway-manifest.md) for what the manifest proves.

### Workbench client (signed-in page only)

`createGatewayClient({origin, csrf, workspace, fetcher})` returns a client that calls the workbench API with the page's session cookie, the session's CSRF token (sent as `X-Deweb-Token`) and, optionally, the selected workspace (`X-TapeNow-Workspace`). Reads work without `csrf`; every change requires it. Origins other than HTTPS (or `http://localhost` for development) are rejected, and IDs are validated before any request.

| Method | Description |
| --- | --- |
| `capabilities()` | Supported chains, file limits and signing method (`tapenow-gateway-capabilities/v1`; public, no sign-in needed). |
| `project(projectId)` | Gateway status of a project. |
| `prepare(releaseId, wallet)` | Returns a message for the chip owner's wallet to sign. Sends no transaction. |
| `publish(releaseId, proof)`, `restore(releaseId, proof)` | Publish or restore a release with `{challengeId, signature}` from that wallet. |
| `retire(releaseId)` | Stop serving a release through the Gateway. |
| `check(projectId)` | Re-check ownership, activation and content now. |
| `recover(projectId)` | Re-link the project to the snapshot the Gateway is serving, after checking that snapshot's integrity. |
| `prepareDomain(domainId)`, `verifyDomain(domainId)`, `disconnectDomain(domainId)` | Connect a customer domain to the Gateway, check it, or disconnect it. |

The SDK never signs anything: the wallet signature for `publish` and `restore` always comes from the user's wallet interface.
