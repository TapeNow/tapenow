# 验证发布归档

[English](verify-a-release.md) · **简体中文**

TapeNow 的发布归档包含网站文件，以及一份用 TapeNow Ed25519 密钥签名的回执。只需要 Node.js，大约一分钟即可完成核验，可以离线进行，也不需要 TapeNow 账号。

## 准备

- Node.js 20.11 或更高版本。
- 归档文件。在工作台打开某个版本的**部署详情**，点击**导出构建与回执**（项目所有者可用）。所有者把 ZIP 发给谁，谁就可以验证。
- 验签工具：本仓库的 `verify/verify-release.mjs` 和 `verify/receipt-keys.mjs`。工作台在 `/tools/verify-release.mjs` 和 `/tools/receipt-keys.mjs` 提供同样的两个文件。请把它们放在同一个文件夹。

## 步骤

1. **解压归档。** 把 `release.json`、`keys.json` 和 `site/` 文件夹放在一起。
2. **固定签名公钥。** 分别从 [KEYS.md](../KEYS.md) 和 <https://app.tapenow.dev/api/keys> 读取指纹，两者必须一致。不要从归档里取指纹：能篡改文件的人，也能篡改归档里的指纹。
3. **获取最新注册表（推荐）。** 把 <https://app.tapenow.dev/api/keys> 保存为 `keys.json`，替换归档里的副本，这样归档生成后才被撤销的公钥也能被发现。
4. **运行验签工具：**

   ```bash
   node verify/verify-release.mjs release.json keys.json <指纹> ./site
   ```

## 结果说明

成功时输出 JSON，退出码为 0：

```json
{
  "verified": true,
  "keyId": "ed25519:360c4430…",
  "legacy": false,
  "status": "current",
  "files": 12,
  "note": "证明归档与该公钥签署内容一致；不证明网站当前在线或数据库未改变。",
  "noteEn": "…"
}
```

- `legacy: true` 表示这是引入 keyId 之前的回执，已直接用固定公钥核验。
- `status: "retired"` 没有问题：该公钥不再签发新回执，但它签过的回执仍然有效。

失败时用中英文输出原因，退出码为 1。常见原因：

| 提示 | 含义 |
| --- | --- |
| `可信公钥不在注册表中或内容不符` | 你固定的指纹不在 `keys.json` 中。检查是否输错，或更新 `keys.json`。 |
| `回执公钥不匹配` | 回执的签名公钥不是你固定的那一个。 |
| `此公钥已撤销` | 不要信任这份回执。 |
| `回执签名无效` | `release.json` 在签名后被修改过。 |
| `清单摘要不一致` | 回执中的文件清单被改动过。 |
| `文件不匹配: <路径>` | `site/` 中的这个文件与签名时不同。 |

## 能证明什么

核验通过证明：这些文件正是密钥持有者签署的文件，回执中记录的发布计划也一并经过签名。它不能证明某个网站此刻正在提供这些文件、数据库没有变化，或者有人审计过内容。详见[发布回执规范](../spec/release-receipt.zh-CN.md)。
