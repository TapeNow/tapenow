# Changelog

**English** · [简体中文](CHANGELOG.zh-CN.md)

Notable changes to the hosted TapeNow workbench at <https://app.tapenow.dev> and to the public tools in this repository. Versions are workbench versions; check the live one at <https://app.tapenow.dev/api/health>. Dates are UTC.

## 0.9.16 — 2026-10-02

- **Docs:** WebMCP tool discovery and calls are now confirmed in Chrome 154 without the testing flag, so the guide no longer limits the tested setup to Ego.

## 0.9.15 — 2026-10-02

- **Docs:** the WebMCP guide and the manual now name Chrome 149 and later, where WebMCP is enabled through Chrome's origin trial (through Chrome 162, ending no later than 29 March 2027). The full agent workflow was tested in Ego (Chromium 152); other browsers are not supported yet.

## 0.9.14 — 2026-10-02

- **WebMCP:** the workbench now takes part in Chrome's WebMCP origin trial (Chrome 149–162), so agents can use its page tools in Chrome without turning on a testing flag. Other browsers are unchanged.
- **Onchain publishing:** paths that a new release drops are now removed after the new files and the entry point are written, which shortens the window in which files are missing. Updates are still made in place, one transaction at a time: the switch is not atomic, and the site may be inconsistent until every transaction is confirmed.

## 0.9.13 — 2026-10-01

- **Feedback:** maintainers now get a daily email digest of new reports, so feedback is seen without checking the inbox page. Reporter emails and wallets are not included in the mail.
- **Public repository.** Verifier, SDKs, specifications, guides and changelog published at TapeNow/tapenow, together with [KEYS.md](KEYS.md), an independent source for the release-signing key fingerprint.

## 0.9.12 — 2026-10-01

- **Verifier:** messages and usage are now shown in Chinese and English; `--help` added. The verification logic is unchanged.
- **Docs:** the integrations guide points to the feedback form instead of an email address.

## 0.9.11 — 2026-09-30

- Consistent English labels in the maintainer feedback inbox.

## 0.9.10 — 2026-09-30

- Maintainers can review, filter and resolve user feedback inside the workbench.

## 0.9.9 — 2026-09-30

- The homepage tapenow.dev is now its own open-source project, [TapeNow/tapenow-website](https://github.com/TapeNow/tapenow-website).
- `https://app.tapenow.dev/?feedback=1` opens the feedback form after sign-in; the homepage links to it instead of an email address.

## 0.9.8 — 2026-09-30

- Fixed: the feedback dialog could appear behind the page on phones and did not cover the sidebar on desktop. All dialogs now open above the whole page.
- Fixed: curly quotes in the English interface were drawn at full width.

## 0.9.7 — 2026-09-30

- New email addresses and new wallets pass a Cloudflare Turnstile check before their first sign-up. Returning users are never asked.

## 0.9.6 — 2026-09-30

- Fixed connecting Vercel and GitHub from Safari for new accounts. Vercel now uses its official installation flow (team optional); failed OAuth callbacks return to the workbench with a clear reason; after a GitHub App installation the connection window reopens automatically; Vercel authorizations removed on the Vercel side are marked for re-authorization.

## 0.9.5 — 2026-09-30

- New homepage. The homepage, workbench, manual and private-preview pages default to English unless you chose Chinese; `?lang=zh-CN` or `?lang=en` overrides it for one visit.
- New email sign-ups receive a numeric code as well as a link.
- Email accounts can link one wallet; afterwards that wallet signs in to the same account. Project owners can invite members by wallet address.
- Free plan: at most 10 newly public versions per workspace per UTC month. Private previews and archives do not count.

## 0.9.4 — 2026-09-30 · limited public beta

- Open sign-up: 50 new accounts per day, 300 in the first phase.
- Sign in with email or with a wallet on BSC, X Layer or Base (Sign-In with Ethereum). Wallets are detected with EIP-6963; OKX, Binance, Coinbase and MetaMask are suggested.
- Free plan for new accounts: 3 projects, 9 versions, 100 MiB.
- Feedback button in the header. Onchain publishing on a phone suggests switching to a desktop browser.

## 0.9.2 — 2026-09-30

- User manual in English and Chinese, with 23 task chapters and real screenshots: <https://app.tapenow.dev/docs/manual/>.

## 0.9.1 — 2026-09-29

- New TapeNow brand across sign-in, the workbench, public docs and private-preview pages.

## 0.9.0 — 2026-09-29

- **WebMCP agent tools.** Native page tools for querying, creating samples and preparing releases, with operation sheets that a person approves before anything consequential runs. See [docs/webmcp.md](docs/webmcp.md).

## 0.8.0 — 2026-09-29

- Invitation beta: account-scoped permissions, a final "is it really live?" check in a real browser, password-protected private previews, retry-safe operations and per-workspace resource counts.

## 0.7.0 — 2026-09-28

- **TapeNow Gateway.** Serve sites published on BSC, X Layer or Base over normal HTTPS: pinned version addresses, a stable project address, customer domains with TLS, ownership checks, restore and retire, and a browser SDK. See [spec/gateway-manifest.md](spec/gateway-manifest.md).
- Base support, with its L1 data and operator fees shown separately.

## 0.6 — 2026-09

- Project roles: Owner, Publisher and Viewer.
- TLS checks for standard PostgreSQL in preview and production, existing business APIs, external dependency lists, fee attribution and project pause.
- BSC and X Layer publishing; HashPort domains on BSC.
- Chinese and English throughout the product.

## 0.5 — 2026-09

- Invitations and first-run guide, password-protected private previews, customer Supabase environments, archive retention points and a 7-day trash.

## 0.4 — 2026-09

- **Release check:** a release pins its files and configuration, checks data compatibility and needs explicit confirmation.
- Restores create a candidate first and never switch the live entry early.
- Signed exports with a SHA-256 manifest and an Ed25519 receipt; public-key registry with current, retired and revoked keys. See [spec/release-receipt.md](spec/release-receipt.md).
