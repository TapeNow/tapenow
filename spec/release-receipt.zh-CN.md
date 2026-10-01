# 发布回执与公钥注册表

[English](release-receipt.md) · **简体中文**

状态：稳定，TapeNow 工作台自 0.4 起按此格式生成。参考实现见 [`verify/`](../verify/)。如有出入，以英文版为准。文中“必须”“不得”“应当”对应 RFC 2119 的 MUST、MUST NOT、SHOULD。

## 1. 发布归档

在工作台点击**导出构建与回执**，会下载一个 ZIP 归档：

```
release.json   签名回执（第 2 节）
keys.json      生成归档时的公钥注册表副本（第 4 节）
VERIFY.txt     简短的验签说明
site/          发布文件，与归档时逐字节相同
```

`keys.json` 只是方便查看的副本。它和回执来自同一处，所以**不得**用它来决定信任哪个公钥（第 5 节）。

## 2. 回执

```json
{
  "payload":   { "...": "第 3 节" },
  "signature": "<base64 编码的 Ed25519 签名>",
  "algorithm": "Ed25519",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n",
  "trust":     "<给人看的说明，不参与验证>"
}
```

- `signature` 是对 `JSON.stringify(payload)` 的 UTF-8 字节做的 Ed25519 签名。
- `publicKey` 是签发者公钥，格式为 PEM 编码的 SPKI。

**序列化。** 被签名的字节与 JavaScript `JSON.stringify` 对解析后的 `payload` 的输出完全相同：键的顺序与 `release.json` 中一致，不含空白，非 ASCII 字符原样保留，转义只用 `\"`、`\\`、`\b`、`\f`、`\n`、`\r`、`\t`，其他控制字符用 `\u00XX`。数字按 ECMAScript 的数字转字符串规则输出；代币金额以十进制字符串存储，不受影响。用其他语言实现时，解析必须保留键的顺序，并按上述规则重新序列化，应当用真实归档测试。

## 3. Payload

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `schema` | 字符串 | `deweb-release/v1`。这个名称早于 TapeNow 品牌，为保持兼容而保留。 |
| `keyId` | 字符串 | 签名公钥的 `ed25519:<指纹>`。早期回执没有此字段。 |
| `releaseId` | 字符串 | `d-` 加 12 位十六进制。 |
| `projectId` | 字符串 | `p-` 加 12 位十六进制。 |
| `files` | 数组 | 文件清单（见下），按 `path` 排序。 |
| `manifestHash` | 字符串 | `JSON.stringify(files)` 的 SHA-256（十六进制）。 |
| `issuedAt` | 字符串 | 签发时间，ISO 8601 UTC 格式。 |
| `kind` | 字符串 | 回执证明的内容（见下）。 |
| `source` | 对象或 null | 构建来源（上传、示例、GitHub 构建、恢复）。 |
| `restoredFrom` | 字符串或 null | 本版本恢复自哪个版本。 |
| `publication`、`chain`、`transactions`、`authorizedWallet` | 对象、数组或 null | 签发时记录的发布和链上信息。 |
| `approval`、`configurationDigest`、`artifactConfiguration`、`approvedConfiguration`、`databaseContract`、`budget`、`nativeAccess` | 对象或 null | 经过审核的发布计划及其配置快照。 |

验签方必须忽略不认识的字段；这些字段同样受签名保护。

`files` 中的每一项：

```json
{ "path": "assets/app.js", "bytes": 1024, "sha256": "<64 位十六进制>", "contentType": "text/javascript" }
```

`path` 是相对路径，使用 `/`，不含 `..`，也不以 `/` 开头。每一项的键严格按上面的顺序排列，这会影响 `manifestHash`。

`kind` 的取值：

| `kind` | 含义 |
| --- | --- |
| `cloud-preview`、`local-preview` | 已在工作台归档，尚未发布。`local-*` 来自自建的开发实例。 |
| `cloud-restore-candidate`、`local-restore-candidate` | 从旧版本创建的恢复候选，尚未发布。 |
| `release-approval` | 所有者批准发布计划时签发。 |
| `cloud-file-verification` | 已发布到托管入口，并逐个文件读回核对。 |
| `chain-file-verification` | 已写入链上，并逐个文件读回核对。 |
| `chain-with-browser-observation` | 已上链，并记录了在真实浏览器中的访问观察。 |

## 4. 公钥注册表（`tapenow-keys/v1`）

地址：`https://app.tapenow.dev/api/keys` 和 `https://app.tapenow.dev/.well-known/tapenow-keys.json`。

```json
{
  "schema": "tapenow-keys/v1",
  "currentKeyId": "ed25519:<指纹>",
  "keys": [
    { "keyId": "ed25519:<指纹>", "fingerprint": "<64 位十六进制>", "algorithm": "Ed25519",
      "publicKey": "<PEM>", "status": "current" }
  ],
  "trust": "<给人看的说明>"
}
```

- `fingerprint` 是公钥 SPKI DER 编码的 SHA-256，写成 64 位小写十六进制。
- `status` 为 `current`（当前）、`retired`（已停用，不再签名，旧回执仍有效）或 `revoked`（已泄露，用它签发的回执必须拒绝）。
- 可选字段：`validFrom`、`retiredAt`、`reason`。

## 5. 验签步骤

输入：回执、注册表、一个独立于归档获得的**固定指纹**（例如来自 [KEYS.md](../KEYS.md) 和线上注册表），以及 `site/` 目录。

1. 固定指纹必须是 64 位小写十六进制。
2. 在注册表中找到 `fingerprint` 等于固定指纹的条目，并用其 `publicKey` 重新计算指纹，两者必须一致。
3. 该条目的 `status` 必须是 `current` 或 `retired`。
4. `algorithm` 必须是 `Ed25519`，回执中 `publicKey` 的指纹必须等于固定指纹。
5. 如果有 `payload.keyId`，必须等于该条目的 `keyId`。
6. 用可信公钥验证对 `JSON.stringify(payload)` 的签名，必须通过。
7. `files` 必须是非空数组，`JSON.stringify(files)` 的 SHA-256 必须等于 `manifestHash`。
8. 每一项的 `path` 必须唯一且为相对路径，解析链接后必须仍在 `site/` 内；文件大小必须正好是 `bytes` 字节，SHA-256 必须等于 `sha256`。

`site/` 中不在清单里的多余文件不会导致验签失败，只是不在回执的证明范围内。

## 6. 有效回执能证明什么

有效回执证明：这些文件与该密钥持有者在 `issuedAt` 时签署的内容一致，签署时的发布计划和状态如 payload 所记录。它**不能**证明网站现在在线、仍在提供这些字节、任何数据库没有变化，或者有人审计过内容。核验线上的 Gateway 网站，请见 [Gateway 清单](gateway-manifest.zh-CN.md)。
