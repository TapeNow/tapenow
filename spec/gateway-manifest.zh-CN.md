# Gateway 清单（`tapenow-gateway/v1`）

[English](gateway-manifest.md) · **简体中文**

状态：自 0.7 起稳定。参考客户端见 [`sdk/tapenow-gateway.mjs`](../sdk/tapenow-gateway.mjs)。如有出入，以英文版为准。

TapeNow Gateway 通过普通 HTTPS 提供已发布到链上（BSC、X Layer 或 Base）的网站。每个 Gateway 网站都在下面的地址公开它正在提供的快照：

```
https://<gateway-host>/__tapenow/manifest.json
```

Gateway 的域名：

- `gw-p-<项目>.tapenow.dev`：项目的稳定地址，会 307 跳转到当前版本的域名。
- `gw-v-<versionId 前 48 位十六进制>.tapenow.dev`：固定的单个版本，内容永不改变。
- 项目所有者连接并验证过的客户自有域名。

## 清单

```json
{
  "schema": "tapenow-gateway/v1",
  "projectId": "p-<12 位十六进制>",
  "releaseId": "d-<12 位十六进制>",
  "target": { "chainId": 8453, "cpuIndex": "2", "tokenId": "12", "cpu": "<地址>", "container": "<地址>" },
  "blockNumber": 51906414,
  "blockHash": "0x<64 位十六进制>",
  "files": [ { "path": "index.html", "bytes": 464, "sha256": "<64 位十六进制>", "contentType": "text/html" } ],
  "fallback": "index.html",
  "manifestHash": "<64 位十六进制>",
  "versionId": "<64 位十六进制>",
  "checkedAt": "2026-09-28T13:29:46.647Z",
  "paidUntil": "2026-10-28T13:13:23.000Z",
  "nativeUrl": "https://<tape-name>.tapekit.org/",
  "verification": "two-rpc-snapshot",
  "mode": "pinned",
  "health": { "status": "active", "checkedAt": "…", "leaseUntil": 0, "paidUntil": 0 }
}
```

| 字段 | 含义 |
| --- | --- |
| `target.chainId` | `56`（BSC）、`196`（X Layer）或 `8453`（Base）。 |
| `target.cpuIndex`、`target.tokenId` | 承载网站的 TapeKit 处理器和芯片编号，十进制字符串。 |
| `target.cpu`、`target.container` | 处理器合约地址和芯片的容器账户地址（校验和格式）。 |
| `blockNumber`、`blockHash` | 检查所有权和激活状态时所用的区块。两个独立的 RPC 服务必须给出一致结果（`verification: "two-rpc-snapshot"`）。 |
| `files`、`manifestHash` | 文件清单及其摘要，算法与[发布回执](release-receipt.zh-CN.md#3-payload)完全相同。 |
| `fallback` | 请求路径不在 `files` 中时返回的文件（用于单页应用）。 |
| `versionId` | 这个快照的标识（见下）。 |
| `checkedAt`、`paidUntil` | 快照的生成时间，以及芯片的 TapeKit 激活费用付到何时。 |
| `nativeUrl` | 由 TapeKit 直接提供的同一网站，使用芯片的 `.tape` 名称。 |
| `health` | 请求清单时服务器附加的实时状态，不参与 `versionId` 计算。 |

### `versionId`

`versionId` 是下面九个字段的规范 JSON 的 SHA-256（十六进制）：

```
schema, projectId, releaseId, target, blockNumber, blockHash, files, fallback, manifestHash
```

这里的规范 JSON 指：在每一层都把对象的键按字母排序（数组顺序不变），去掉值为 `undefined` 的键，然后执行 `JSON.stringify`。如果存储的清单算不出对应的 `versionId`，服务器会拒绝提供该快照。

## 核验一个 Gateway 网站

1. 通过 HTTPS 获取清单，不跟随跳转，检查 `schema` 和 `target.chainId`。
2. 根据 `files` 重新计算 `manifestHash`，根据九个字段重新计算 `versionId`。
3. 从**同一个源**获取你关心的文件，与 `files` 中的长度和 SHA-256 比对。SDK 中的 `verifyGatewayFile` 就是做这件事。
4. 要把网站和签名版本对应起来，把 `releaseId`、`manifestHash` 与一份已用固定公钥验证过的[发布回执](release-receipt.zh-CN.md)比对。

清单本身没有签名。它提供的是一份可以核对的精确声明：文件摘要、核对时所用的区块，以及一个能把文件与签名回执关联起来的摘要。如果你自己读取 `blockNumber` 时的链上数据（或打开 `nativeUrl`），就完全不需要信任 Gateway 服务器。

每个 Gateway 文件的响应头都包含：`X-TapeNow-Project`、`X-TapeNow-Chain`、`X-TapeNow-Version`（即 `versionId`）、`X-TapeNow-Verification`（`pinned`；最近一次复查未完成时为 `stale`）和 `X-TapeNow-Checked-At`。
