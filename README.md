<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/lockup-dark.svg">
    <img src="assets/lockup-light.svg" width="220" alt="TapeNow">
  </picture>
</p>

<p align="center">
  <strong>Build with your agent. Ship it onchain.</strong><br>
  Public tools, specifications, documentation and issue tracker for <a href="https://tapenow.dev">TapeNow</a>.
</p>

<p align="center">
  <a href="https://github.com/TapeNow/tapenow/actions/workflows/ci.yml"><img src="https://github.com/TapeNow/tapenow/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  &nbsp;<code>Apache-2.0</code>
</p>

<p align="center"><b>English</b> · <a href="README.zh-CN.md">简体中文</a></p>

---

## About TapeNow

[TapeNow](https://tapenow.dev) is a release workbench for web projects in the TapeOut ecosystem. Import a build, share a private preview, keep every version as a signed archive, and publish to **BSC, X Layer and Base**. With **WebMCP**, your AI agent can prepare releases with you inside the workbench; you approve every consequential action.

- Workbench: <https://app.tapenow.dev> (limited public beta)
- User manual (English / 中文): <https://app.tapenow.dev/docs/manual/>
- Homepage source: [TapeNow/tapenow-website](https://github.com/TapeNow/tapenow-website)

## What is in this repository

TapeNow signs what it publishes so that you do not have to trust it blindly. This repository holds everything you need to check that independently, plus the interfaces an agent or a script can build on.

```
verify/      Offline verifier for release archives (Node.js built-ins only, no network)
sdk/         Browser helpers: WebMCP tool calls and Gateway proof checks
spec/        Formats: release receipts, the public-key registry, Gateway manifests, WebMCP tools
docs/        Guides (English and 简体中文)
test/        Tests for everything above (node --test)
KEYS.md      Fingerprints of TapeNow's release-signing keys
CHANGELOG.md Release notes for the hosted workbench
```

The workbench itself (web app, API and Cloudflare Worker) is not open source today. The files here are exported from it one way, so the verifier and SDKs in this repository are byte-for-byte the ones the workbench serves at `/tools/` and `/sdk/`.

## Verify a release in one minute

In the workbench, open **Deployment details** for a release and click **Export build and receipt** (project owners). Unzip the archive, then:

```bash
git clone https://github.com/TapeNow/tapenow.git
node tapenow/verify/verify-release.mjs release.json keys.json \
  360c4430f1a18117c2663330d573a14132e6797635fa704cb6e00d195e74b7ff ./site
```

The long hex string is the current signing-key fingerprint. Do not copy it from an archive: check it against [KEYS.md](KEYS.md) in this repository and against `https://app.tapenow.dev/api/keys`. Success prints `"verified": true`; a changed file, a different key, a broken signature or a revoked key fails. Full walkthrough: [docs/verify-a-release.md](docs/verify-a-release.md).

## Documentation

| Topic | English | 简体中文 |
| --- | --- | --- |
| Verify a release archive | [verify-a-release.md](docs/verify-a-release.md) | [verify-a-release.zh-CN.md](docs/verify-a-release.zh-CN.md) |
| Agent tools (WebMCP) | [webmcp.md](docs/webmcp.md) | [webmcp.zh-CN.md](docs/webmcp.zh-CN.md) |
| Browser SDKs | [sdk.md](docs/sdk.md) | [sdk.zh-CN.md](docs/sdk.zh-CN.md) |
| Release receipt and key registry format | [release-receipt.md](spec/release-receipt.md) | [release-receipt.zh-CN.md](spec/release-receipt.zh-CN.md) |
| Gateway manifest format | [gateway-manifest.md](spec/gateway-manifest.md) | [gateway-manifest.zh-CN.md](spec/gateway-manifest.zh-CN.md) |
| WebMCP tool schemas (machine-readable) | [webmcp-tools.json](spec/webmcp-tools.json) | |

Product guides for everyday use (signing in, importing, previews, publishing onchain, fees) are in the [user manual](https://app.tapenow.dev/docs/manual/).

## Develop

Requires Node.js 20.11 or later. There are no dependencies to install.

```bash
npm test         # verifier, SDK and schema tests
npm run check    # links, bilingual pairs, no credentials or personal data
```

## Feedback and contributing

- **Product bugs and ideas:** open an [issue](https://github.com/TapeNow/tapenow/issues/new/choose), or use the feedback button in the workbench (<https://app.tapenow.dev/?feedback=1>).
- **Security problems:** report privately, never in a public issue. See [SECURITY.md](SECURITY.md).
- **Pull requests:** welcome for docs, translations and tests. Code changes are applied upstream and exported back here; see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

The code and text in this repository are licensed under the [Apache License 2.0](LICENSE). The TapeNow name, logos and brand assets are **not** covered by that license; see [TRADEMARKS.md](TRADEMARKS.md).
