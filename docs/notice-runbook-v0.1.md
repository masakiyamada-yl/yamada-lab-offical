---
version: "0.1"
date: 2026-05-10
author: engineering-lead
status: ドラフト
related:
  - notice-page-design-v0.1.md
  - "yamada-lab-noc/docs/phase2-design-v0.4.md §4.6"
---

# 障害情報公知ページ 運用ランブック v0.1

`yamada-lab.co.jp/notice` の運用手順書。Cityroam 技術・運用基準 §6.14 公知義務遵守の実務マニュアル。

---

## 1. 公開フロー（標準: info / warning）

```
1. NOC で事象検知 → engineering-lead が状況把握
2. content/notice/incidents/incident-YYYYMMDD-NN.yaml を新規作成
   - 初稿: status=investigating + summary + timeline 1 件
3. ローカルで `npm run prebuild` を実行し schema 検証 + 機密検出を確認
4. git add → commit → push (main 直接 push 可)
5. GitHub Actions ci.yml が build → deploy-pages で自動公開
6. Cloudflare CDN 経由 60 秒以内に反映
7. 状況更新時は同 YAML の updates/timeline 配列に追記して再 push
8. 復旧時に status=resolved + resolved_at を追加して最終 push
```

**ビルド時間目安**: npm install 含めて 2〜4 分、CDN 反映 60 秒、**合計 5 分以内** が標準。

---

## 2. critical 時の即時化（Cloudflare Cache Purge）

severity=critical のときは標準 60 秒待機を短縮するため、Cloudflare API で対象 URL の cache purge を発行する。

### 2.1 purge 対象 URL
- `https://yamada-lab.co.jp/`
- `https://yamada-lab.co.jp/notice/incidents.json`
- `https://yamada-lab.co.jp/notice/feed.xml`
- `https://www.yamada-lab.co.jp/`（www への 301 redirect 先）

### 2.2 手順
公式ドキュメント未確認のため実行前に <https://developers.cloudflare.com/api/operations/zone-purge> を確認すること。

```bash
# Cloudflare API token (Cache Purge:Edit のみのスコープ) を環境変数に
export CF_API_TOKEN="<token>"
export CF_ZONE_ID="<yamada-lab.co.jp の zone ID>"

curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      "https://yamada-lab.co.jp/",
      "https://yamada-lab.co.jp/notice/incidents.json",
      "https://yamada-lab.co.jp/notice/feed.xml",
      "https://www.yamada-lab.co.jp/"
    ]
  }'
```

token 保管場所と自動化是非は [notice-page-design-v0.1.md §10 Q-1] で確定する（v0.1 時点では未確定）。

---

## 3. 誤公開時のロールバック

### 3.1 内容訂正（軽微）
誤記・タイポ等は **timeline 末尾に訂正エントリを追加** して再 push する。Git rebase / force push は **禁止**（改ざん耐性確保のため）。

```yaml
timeline:
  - at: "2026-05-10T11:00:00+09:00"
    body: "原因調査中。"
  - at: "2026-05-10T12:00:00+09:00"
    body: "復旧しました。"
  - at: "2026-05-10T12:30:00+09:00"
    body: "12:00 の記載に誤りがあったため訂正します。実際の復旧時刻は 12:15 でした。"
```

### 3.2 完全撤回（重大）
機密情報を含めて公開してしまった等の場合は、該当 YAML を削除して再 push し、即座に Cloudflare Cache Purge を発行する（§2.2）。Git 履歴は残るため、削除コミットの message に「v0.1 ロールバック手順 §3.2 適用」と明記する。

なお機密パターンは prebuild の機械検出で **build を fail させる** 設計のため、通常は本番に出る前に止まる。検出パターンは `scripts/build-notice.ts` の `SECRET_PATTERNS` を参照。

---

## 4. 機密検出 (CI) のトラブルシュート

### 4.1 false positive で公開できない場合
prebuild が機密パターン検出で fail した場合、エラーメッセージに「該当ファイル名:行番号 + マッチ文字列 + パターンカテゴリ」が出る。意図的に書きたい正当な記載で false positive の場合は:

1. 表現を別の語に置換（例: `10.1.2.3` を「弊社内部 IP」と一般化）
2. 表現を変えられない場合は `scripts/build-notice.ts` の `SECRET_PATTERNS` を見直す PR を起こす

### 4.2 CI で fail を見落とす対策
CI で deploy job が skip されるため自動的に本番反映は止まる。Slack 通知（`notify-slack-on-failure` job）で `#github-activity` に通知される設計。ローカルで `npm run prebuild` を必ず先行実行する。

---

## 5. Atom フィード関連

- `https://yamada-lab.co.jp/notice/feed.xml` を RSS リーダや watcher で購読可能
- `<feed>` 要素の `updated` は最新エントリの updated 時刻と同期
- 各 entry の `<id>` は HashRouter URL（`#/notice/<id>`）

---

## 6. 連絡先

公開ページ末尾の代表メールアドレスは `support@yamada-lab.co.jp`（連絡先 contact フィールド）。担当エージェント振り分けは `customer-support` 起点。
