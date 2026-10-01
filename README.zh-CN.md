<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/lockup-dark.svg">
    <img src="assets/lockup-light.svg" width="220" alt="TapeNow">
  </picture>
</p>

<p align="center">
  <strong>和 Agent 一起，把作品发布到链上。</strong><br>
  <a href="https://tapenow.dev">TapeNow</a> 的公开工具、格式规范、文档和问题反馈。
</p>

<p align="center">
  <a href="https://github.com/TapeNow/tapenow/actions/workflows/ci.yml"><img src="https://github.com/TapeNow/tapenow/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  &nbsp;<code>Apache-2.0</code>
</p>

<p align="center"><a href="README.md">English</a> · <b>简体中文</b></p>

---

## 关于 TapeNow

[TapeNow](https://tapenow.dev) 是 TapeOut 生态的网页作品发布工作台。你可以导入构建产物、分享私有预览、把每个版本保存为带签名的归档，并发布到 **BSC、X Layer 和 Base**。借助 **WebMCP**，你的 AI Agent 可以在工作台里和你一起准备发布；每一个重要操作都由你确认。

- 工作台：<https://app.tapenow.dev>（限量公开测试）
- 用户手册（English / 中文）：<https://app.tapenow.dev/docs/manual/>
- 首页源码：[TapeNow/tapenow-website](https://github.com/TapeNow/tapenow-website)

## 仓库内容

TapeNow 会给发布的内容签名，你不需要盲目信任它。独立核验所需的一切都在这个仓库里，另外还有 Agent 和脚本可以直接使用的接口。

```
verify/      发布归档的离线验签工具（只用 Node.js 内置模块，不联网）
sdk/         浏览器助手模块：调用 WebMCP 工具、核验 Gateway 证明
spec/        格式规范：发布回执、公钥注册表、Gateway 清单、WebMCP 工具
docs/        使用指南（English 和简体中文）
test/        以上所有内容的测试（node --test）
KEYS.md      TapeNow 发布签名公钥的指纹
CHANGELOG.md 线上工作台的更新日志
```

工作台本身（网页应用、API 和 Cloudflare Worker）目前不开源。这里的文件从工作台源码单向导出，所以本仓库的验签工具和 SDK 与工作台在 `/tools/`、`/sdk/` 下提供的文件逐字节相同。

## 一分钟验证一个版本

在工作台打开某个版本的**部署详情**，点击**导出构建与回执**（项目所有者可用）。解压后运行：

```bash
git clone https://github.com/TapeNow/tapenow.git
node tapenow/verify/verify-release.mjs release.json keys.json \
  360c4430f1a18117c2663330d573a14132e6797635fa704cb6e00d195e74b7ff ./site
```

这串 64 位十六进制字符是当前签名公钥的指纹。不要从归档里复制它，请同时对照本仓库的 [KEYS.md](KEYS.md) 和 `https://app.tapenow.dev/api/keys`。成功时输出 `"verified": true`；文件被改动、公钥被替换、签名损坏或公钥已撤销都会失败。完整步骤见 [docs/verify-a-release.zh-CN.md](docs/verify-a-release.zh-CN.md)。

## 文档

| 主题 | English | 简体中文 |
| --- | --- | --- |
| 验证发布归档 | [verify-a-release.md](docs/verify-a-release.md) | [verify-a-release.zh-CN.md](docs/verify-a-release.zh-CN.md) |
| Agent 工具（WebMCP） | [webmcp.md](docs/webmcp.md) | [webmcp.zh-CN.md](docs/webmcp.zh-CN.md) |
| 浏览器 SDK | [sdk.md](docs/sdk.md) | [sdk.zh-CN.md](docs/sdk.zh-CN.md) |
| 发布回执与公钥注册表格式 | [release-receipt.md](spec/release-receipt.md) | [release-receipt.zh-CN.md](spec/release-receipt.zh-CN.md) |
| Gateway 清单格式 | [gateway-manifest.md](spec/gateway-manifest.md) | [gateway-manifest.zh-CN.md](spec/gateway-manifest.zh-CN.md) |
| WebMCP 工具定义（机器可读） | [webmcp-tools.json](spec/webmcp-tools.json) | |

日常使用说明（登录、导入、预览、链上发布、费用）见[用户手册](https://app.tapenow.dev/docs/manual/?lang=zh-CN)。

## 本地开发

需要 Node.js 20.11 或更高版本，无需安装任何依赖。

```bash
npm test         # 验签工具、SDK 和格式定义的测试
npm run check    # 链接、中英文配对，以及不含密钥和个人信息
```

## 反馈与贡献

- **产品问题和建议：** 提交 [Issue](https://github.com/TapeNow/tapenow/issues/new/choose)，或使用工作台里的反馈按钮（<https://app.tapenow.dev/?feedback=1>）。
- **安全问题：** 请私下报告，不要发公开 Issue。见 [SECURITY.md](SECURITY.md)。
- **Pull Request：** 欢迎改进文档、翻译和测试。代码修改会先在上游完成，再导出到这里，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

本仓库的代码和文字采用 [Apache License 2.0](LICENSE)。TapeNow 名称、Logo 和品牌素材**不在**该许可证范围内，见 [TRADEMARKS.md](TRADEMARKS.md)。
