# 浏览器 SDK

[English](sdk.md) · **简体中文**

两个无依赖的小型 ES 模块。工作台在 `https://app.tapenow.dev/sdk/` 提供它们，[`sdk/`](../sdk/) 中的副本与之完全相同。

## `tapenow-webmcp.mjs`：调用 WebMCP 工具

供在**已登录的工作台页面内**运行的 Agent 和自动化脚本使用的同页面助手模块。它不是远程 MCP 客户端；浏览器不支持 WebMCP 时，也不会伪造一个 `modelContext`。

| 函数 | 说明 |
| --- | --- |
| `discover(context = document.modelContext)` | 返回名称以 `tapenow_` 开头、且 `origin` 与当前页面一致（页面有 origin 时）的已注册工具。浏览器不支持 WebMCP 时抛出 `Native WebMCP unavailable`。 |
| `call(name, args = {}, context = document.modelContext)` | 调用一个工具并返回解码后的结果。每个 context 第一次调用时，先用只读工具 `tapenow_context` 探测参数格式（对象或 JSON 字符串），因此重要工具绝不会被发送两次。工具未注册时抛出 `Sign in and rediscover current TapeNow tools`。 |

```js
const sdk = await import('/sdk/tapenow-webmcp.mjs');
const context = await sdk.call('tapenow_context');
await sdk.call('tapenow_create_project', {name: 'Demo', requestId: crypto.randomUUID()});
```

工具名称、输入和标注见 [webmcp.zh-CN.md](webmcp.zh-CN.md) 和 [spec/webmcp-tools.json](../spec/webmcp-tools.json)。

## `tapenow-gateway.mjs`：核验和管理 Gateway 网站

### 公开核验（任意来源可用）

| 函数 | 说明 |
| --- | --- |
| `readGatewayManifest(url, {fetcher})` | 通过 HTTPS 获取网站的 `/__tapenow/manifest.json`，不跟随跳转，并检查格式（`tapenow-gateway/v1`）和链（56、196 或 8453）。 |
| `verifyGatewayFile(url, file, {fetcher})` | 从同一个源获取清单中的一个文件，检查长度和 SHA-256。拒绝 `../x`、绝对路径等不安全路径。返回 `{verified, bytes, sha256}`。 |

```js
import {readGatewayManifest, verifyGatewayFile} from './sdk/tapenow-gateway.mjs';
const site = 'https://gw-p-d0b1c8d85355.tapenow.dev';
const manifest = await readGatewayManifest(site);
for (const file of manifest.files) await verifyGatewayFile(site, file);
```

清单能证明什么，见 [Gateway 清单规范](../spec/gateway-manifest.zh-CN.md)。

### 工作台客户端（仅限已登录页面）

`createGatewayClient({origin, csrf, workspace, fetcher})` 返回一个客户端，它使用页面的会话 Cookie、本次会话的 CSRF 令牌（通过 `X-Deweb-Token` 发送）以及可选的当前工作空间（`X-TapeNow-Workspace`）调用工作台 API。读取不需要 `csrf`，所有修改都需要。非 HTTPS 的源（开发用的 `http://localhost` 除外）会被拒绝，发送请求前会校验所有编号。

| 方法 | 说明 |
| --- | --- |
| `capabilities()` | 支持的链、文件限制和签名方式（`tapenow-gateway-capabilities/v1`；公开接口，无需登录）。 |
| `project(projectId)` | 项目的 Gateway 状态。 |
| `prepare(releaseId, wallet)` | 返回一段需要芯片持有人钱包签名的消息，不发送交易。 |
| `publish(releaseId, proof)`、`restore(releaseId, proof)` | 用该钱包签出的 `{challengeId, signature}` 发布或恢复版本。 |
| `retire(releaseId)` | 停止通过 Gateway 提供该版本。 |
| `check(projectId)` | 立即重新检查所有权、激活状态和内容。 |
| `recover(projectId)` | 先核对 Gateway 正在提供的快照是否完整，再把项目重新关联到这个快照。 |
| `prepareDomain(domainId)`、`verifyDomain(domainId)`、`disconnectDomain(domainId)` | 把客户域名接入 Gateway、检查或断开。 |

SDK 从不签名：`publish` 和 `restore` 需要的钱包签名始终来自用户的钱包界面。
