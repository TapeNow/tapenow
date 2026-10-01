# Contributing · 参与贡献

**English** · [简体中文](#简体中文)

Thank you for helping. TapeNow is in a limited public beta, so the most useful contributions right now are clear bug reports and ideas.

## Issues

- **Bugs:** use the *Bug report* form. Include what you did, what you expected and what happened, plus your browser and the workbench version (open <https://app.tapenow.dev/api/health> and copy `version`). Screenshots help; please blur email addresses, wallet addresses you do not want to share, and any preview passwords.
- **Ideas:** use the *Feature request* form and describe the problem before the solution.
- **Security problems:** never in a public issue. See [SECURITY.md](SECURITY.md).
- **Account-specific problems** (quota, sign-in to a specific account): use the feedback button in the workbench instead, so you do not have to post account details publicly.

## Pull requests

This repository is exported one way from the TapeNow source, so pull requests are not merged here directly. Open one as usual and we review it here. When it is accepted, a maintainer applies it upstream with a `Co-authored-by:` line crediting you, the next export brings it back here, and we close the pull request with a link to that commit.

Guides, translations, specification text and tests are the easiest to accept. Files under `verify/`, `sdk/`, `spec/webmcp-tools.json` and the tool table in `docs/webmcp*.md` are copied or generated from the workbench source, so changes to them take longer.

Before you push:

```bash
npm test
npm run check
```

Keep English and Chinese in step: if you change `docs/x.md`, change `docs/x.zh-CN.md` too (or say in the pull request that a translation is needed).

By contributing you agree that your contribution is licensed under the Apache License 2.0, as described in section 5 of the [license](LICENSE).

---

## 简体中文

谢谢你的帮助。TapeNow 目前处于限量公开测试阶段，现在最有价值的是清楚的问题报告和建议。

### Issue

- **问题报告：** 使用 *Bug report* 表单。写明你做了什么、预期结果和实际结果，以及浏览器和工作台版本（打开 <https://app.tapenow.dev/api/health>，复制其中的 `version`）。截图很有帮助；请遮住邮箱、你不想公开的钱包地址和预览密码。
- **功能建议：** 使用 *Feature request* 表单，先描述遇到的问题，再说想要的方案。
- **安全问题：** 绝不要发公开 Issue，见 [SECURITY.md](SECURITY.md)。
- **与具体账号有关的问题**（额度、某个账号无法登录等）：请使用工作台里的反馈按钮，避免在公开场合贴出账号信息。

### Pull Request

本仓库从 TapeNow 源码单向导出，所以 Pull Request 不会在这里直接合并。请照常提交，我们会在这里评审。接受后，维护者会在上游应用你的修改，并用 `Co-authored-by:` 注明你的贡献；下一次导出时修改会同步回来，我们再附上该提交的链接，关闭这个 Pull Request。

指南、翻译、规范文字和测试的修改最容易接受。`verify/`、`sdk/`、`spec/webmcp-tools.json` 以及 `docs/webmcp*.md` 里的工具表是从工作台源码复制或生成的，修改需要更长时间。

推送前请运行：

```bash
npm test
npm run check
```

请保持中英文同步：修改 `docs/x.md` 时也修改 `docs/x.zh-CN.md`（或在 Pull Request 里说明需要翻译）。

提交贡献即表示你同意按 Apache License 2.0 授权你的贡献（见[许可证](LICENSE)第 5 条）。
