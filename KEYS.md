# Release-signing keys · 发布签名公钥

**English.** TapeNow signs every release receipt with an Ed25519 key. To verify a receipt you must *pin* the key's fingerprint from a source you trust, independently of the archive you are checking. This file is one such source; the live registry at <https://app.tapenow.dev/api/keys> (also `/.well-known/tapenow-keys.json`) is another. They must agree. If they do not, do not trust the receipt and [report it privately](SECURITY.md).

The fingerprint is the SHA-256 of the key's SPKI DER encoding, written as 64 lowercase hexadecimal characters. A key ID is `ed25519:` followed by the fingerprint. The Git history of this file is the public record of key changes.

**中文。** TapeNow 用 Ed25519 密钥为每份发布回执签名。验签时必须从你信任的、独立于该归档的渠道**固定**公钥指纹。本文件是这样的渠道之一；线上注册表 <https://app.tapenow.dev/api/keys>（也可访问 `/.well-known/tapenow-keys.json`）是另一个，两者必须一致。如果不一致，请不要信任该回执，并[私下报告](SECURITY.md)。

指纹是公钥 SPKI DER 编码的 SHA-256，写成 64 位小写十六进制。keyId 为 `ed25519:` 加上指纹。本文件的 Git 历史就是密钥变更的公开记录。

## Keys · 公钥

| Status · 状态 | Fingerprint · 指纹 |
| --- | --- |
| `current` · 当前 | `360c4430f1a18117c2663330d573a14132e6797635fa704cb6e00d195e74b7ff` |

```
-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAOzbsjr8lMbbcBznSMsm+Y2QBYHrQdvwISwg9M1/BJlI=
-----END PUBLIC KEY-----
```

## Rotation and revocation · 轮换与撤销

**English.** The production key has not been rotated. When it is, the previous key stays in the registry as `retired` and old receipts keep verifying against it; this file gains a row and the change is noted in [CHANGELOG.md](CHANGELOG.md). A compromised key is marked `revoked`; the verifier then rejects every receipt signed by it.

**中文。** 生产密钥尚未轮换过。轮换时，旧公钥会以 `retired` 状态留在注册表中，旧回执仍可用它核验；本文件会新增一行，并在 [CHANGELOG.md](CHANGELOG.md) 中说明。泄露的密钥会标记为 `revoked`，验签工具随后会拒绝该密钥签发的所有回执。
