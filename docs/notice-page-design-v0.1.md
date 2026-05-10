---
version: "0.1"
date: 2026-05-10
author: engineering-lead
status: ドラフト
related: yamada-lab-noc/docs/phase2-design-v0.4.md §4.6
---

# コーポレートサイト 障害情報公知ページ 設計書 v0.1

## 0. 改訂サマリ

- **改訂日時**: 2026-05-10（NOC Phase 2 v0.4 §4.6 の corp site 委譲決定を受けた新規起案）
- **背景**: NOC Phase 2 v0.4 において Cityroam 技術・運用基準 §6.14 障害情報公知は **NOC スコープ外** とし、コーポレートサイト (`yamada-lab.co.jp` / リポ `yamada-lab-offical`) 側で実装することが経営者明示で確定した。本設計書は corp site 側の `/notice` 機能の v0.1 設計を確定する。
- **基本方針**: 既存 React 19 + Vite 7 + Tailwind 4 + react-router-dom 7（HashRouter）+ GitHub Pages デプロイ構成を維持したまま、障害情報を YAML としてリポにコミット → ビルド時静的生成 → GitHub Pages → Cloudflare CDN 経由で配信する **静的 + Git ベース** の最小構成を採用する。サーバ・DB・Cloud Run を **一切追加しない**。
- **対象範囲**: 障害情報の一覧 / 個別 / Atom フィードの 3 経路と、データ schema、コンテンツ運用ルール、既存サイト統合、実装タスク（Phase 分割）まで。
- **承認状態**: 本書は engineering-lead 起案のドラフト。経営者承認後に Phase A 実装タスクを分解する。

---

## 1. 目的

Cityroam 技術・運用基準 §6.14（障害情報の公知）の運用事業者義務を **コーポレートサイト** 側で達成する。具体的には:

| 義務 | 本設計書での実装 |
|---|---|
| 障害情報の独立公開ページ | `/notice` 一覧 + `/notice/<id>` 個別（HashRouter 経由） |
| パーマリンク | `https://yamada-lab.co.jp/#/notice/<id>` を ID 不変で発行 |
| フィード（推奨） | `https://yamada-lab.co.jp/notice/feed.xml`（Atom 1.0、ビルド時静的生成） |
| 改ざん耐性 | Git コミット履歴 + GitHub の保護ブランチ（main のみ deploy）で担保 |
| 公知運用ルール | §7 コンテンツ運用ルール（機密・個人特定・内部 IP・社内連絡網の禁止） |

本機能は **対外公開専用** であり、IAP 認証は適用しない。NOC（内部運用、IAP 全パス保護）とは完全分離する。

---

## 2. スコープ

### 2.1 含む

- `/notice` 一覧ページ（公開中インシデント + 過去履歴の時系列表示）
- `/notice/<id>` 個別ページ（タイムライン、影響サービス、復旧時刻、連絡先）
- `/notice/feed.xml` Atom 1.0 フィード（ビルド時生成）
- 障害情報 YAML schema 定義 + 配置場所（`content/notice/incidents/*.yaml`）
- 既存ヘッダ / フッタへの「障害情報」リンク追加
- 空状態 UI（公開中障害ゼロ時の表示）
- WCAG 2.1 AA 最低限準拠（コントラスト・ランドマーク・キーボード操作）
- NOC dashboard footer から本ページへの外部リンク誘導の URL 仕様
- ビルド時に YAML を読み込む Vite plugin / build script の選定方針
- 機密含有を検出する pre-commit / CI チェックの方針

### 2.2 含まない

- 認証・ログイン機能（公開ページのため不要）
- メール / SMS / Push 通知（Phase 3 候補、§10 Q-3）
- 多言語対応（Phase 1 は日本語のみ。英語は Phase 3 候補、§10 Q-4）
- 管理画面 / WYSIWYG エディタ（YAML 直接編集 + git push のみ）
- 過去 NOC 内部ログとの突合表示（NOC 側責務）
- リアルタイム更新（CDN キャッシュ TTL 60 秒に従う）
- アクセス解析 / SLA メトリクス公開（Phase 3 候補）

---

## 3. URL 設計

### 3.1 経路一覧

| 種別 | URL | 配信方式 | キャッシュ |
|---|---|---|---|
| 一覧 | `https://yamada-lab.co.jp/#/notice` | HashRouter（既存 SPA） | Cloudflare 60s |
| 個別 | `https://yamada-lab.co.jp/#/notice/<id>` | HashRouter（既存 SPA） | Cloudflare 60s |
| Atom | `https://yamada-lab.co.jp/notice/feed.xml` | 静的ファイル（dist 直配信） | Cloudflare 60s |
| データ JSON | `https://yamada-lab.co.jp/notice/incidents.json` | 静的ファイル（dist 直配信） | Cloudflare 60s |

### 3.2 URL 設計上の注意

- 既存 corp site が **HashRouter** を使用しているため、SPA ルーティングは `#/notice` 形式となる（`src/main.tsx` 参照）。BrowserRouter への移行は本タスクのスコープ外とし、Atom フィードや `incidents.json` のように **クローラ・RSS リーダから直接参照されるリソースは fragment を含まない静的パス** で配信する。
- パーマリンク要件（§6.14）は Atom `<id>` および `<link>` に `https://yamada-lab.co.jp/#/notice/<id>` を記載することで満たす。SNS シェア / メール添付等の人間向けリンクも同形式。
- `<id>` は `incident-YYYYMMDD-NN`（例: `incident-20260510-01`）の固定書式とし、同日複数発生時に NN を 01 から連番。**ID は確定後変更しない**（パーマリンク不変性）。
- N-1 として §10 で「HashRouter 配下 fragment URL を SNS / 検索エンジンが正しく解釈するか」を検証課題に挙げる。

### 3.3 NOC からの参照

NOC v0.4 §4.6 で示された dashboard footer の外部リンクは以下を採用する:

```
障害情報公知: https://yamada-lab.co.jp/#/notice
```

本 URL は corp site 側で **常時到達可能** であり、本リポの `main` ブランチへの merge により即時更新される。NOC 側からは API 連携・iframe 埋め込みは行わず、テキストリンクのみとする。

---

## 4. データ schema

### 4.1 配置場所

```
yamada-lab-offical/
├── content/
│   └── notice/
│       └── incidents/
│           ├── incident-20260510-01.yaml
│           ├── incident-20260512-01.yaml
│           └── ...
├── scripts/
│   └── build-notice.ts        # YAML → JSON / Atom 変換 build script
├── src/
│   └── pages/
│       ├── NoticeList.tsx
│       └── NoticeDetail.tsx
└── public/
    └── (ビルド出力で /notice/feed.xml と /notice/incidents.json を生成)
```

### 4.2 incident YAML schema（v0.1）

```yaml
# content/notice/incidents/incident-20260510-01.yaml
id: incident-20260510-01                    # 必須・不変・URL に直結
title: "Cityroam 認証サービスにおけるログイン遅延"  # 必須・100 文字以内
severity: warning                            # 必須・enum: info | warning | critical
status: resolved                             # 必須・enum: investigating | identified | monitoring | resolved
affected_services:                           # 必須・1 要素以上
  - "Cityroam 認証 (eduroam 連携を含む)"
started_at: "2026-05-10T09:15:00+09:00"      # 必須・ISO8601 + offset
resolved_at: "2026-05-10T11:42:00+09:00"     # status=resolved のとき必須
summary: |                                   # 必須・200 文字以内・概要
  認証要求の一部 (約 12%) が応答遅延となる事象を検知し、
  RADIUS プロキシのスレッドプール枯渇が原因と特定、
  設定変更の上で復旧しました。
timeline:                                    # 必須・時系列順・1 要素以上
  - at: "2026-05-10T09:15:00+09:00"
    status: investigating
    body: "認証応答遅延の検知。原因調査を開始しました。"
  - at: "2026-05-10T10:20:00+09:00"
    status: identified
    body: "RADIUS プロキシのスレッドプール上限到達を確認しました。"
  - at: "2026-05-10T11:00:00+09:00"
    status: monitoring
    body: "プール上限を引き上げる設定変更を適用し、応答時間の回復を確認しました。経過監視中です。"
  - at: "2026-05-10T11:42:00+09:00"
    status: resolved
    body: "30 分以上正常応答を継続したため復旧と判定しました。"
contact:                                     # 必須・代表問合せ先
  email: "support@yamada-lab.co.jp"
  form_url: "https://yamada-lab.co.jp/#/contact"  # 任意
related_links: []                            # 任意・関連告知の id 配列
```

### 4.3 schema 検証ルール

| 項目 | 検証 |
|---|---|
| `id` | 正規表現 `^incident-\d{8}-\d{2}$`、ファイル名と一致 |
| `severity` | enum `info` / `warning` / `critical` 以外を拒否 |
| `status` | enum 4 値以外を拒否 |
| `started_at` / `resolved_at` / `timeline[].at` | ISO8601 + offset、`Date.parse` 成功 |
| `resolved_at` | `status=resolved` のとき必須、`>= started_at` |
| `title` | 100 文字超を拒否 |
| `summary` | 200 文字超を拒否 |
| `timeline` | 空配列を拒否、`at` 昇順を強制（CI で sort 検証） |
| 機密検出 | §7 の正規表現リストにマッチした場合 build を fail（CI） |

検証は `scripts/build-notice.ts` 内で行い、不正な YAML が 1 件でもあれば `npm run build` 全体を fail させる（GitHub Pages deploy も自動停止）。

### 4.4 派生生成物

| ファイル | 生成元 | 用途 |
|---|---|---|
| `dist/notice/incidents.json` | 全 YAML を結合 + 新しい順 sort | フロントエンドの一覧 / 個別ページ表示用データ |
| `dist/notice/feed.xml` | 全 YAML から Atom 1.0 生成（`updated`、`published`、`summary`、`content` を埋める） | RSS リーダ / 検索エンジン / 外部 watcher |

---

## 5. UI 仕様

### 5.1 一覧ページ `/#/notice`

#### レイアウト

- ヘッダ: 既存サイトのヘッダコンポーネントを流用（`PrivacyPolicy.tsx` と同様）
- パンくず: `トップ > 障害情報`
- 見出し: `<h1>障害情報</h1>` + 補足「Cityroam 認証サービス等の障害・メンテナンス情報を掲載しています」
- 公開中インシデント（`status != resolved`）のセクション
- 過去のインシデント（`status == resolved`、新しい順）のセクション
- 各エントリの表示要素: severity バッジ / status バッジ / `title`（個別ページへの link）/ `started_at` / `resolved_at`（あれば）/ 影響サービス（最大 2 件 + `他 N 件`）
- フッタ: 既存サイトのフッタコンポーネント流用 + Atom フィードリンク（`<link rel="alternate" type="application/atom+xml" href="/notice/feed.xml">` を `<head>` にも挿入）

#### バッジカラー（Tailwind 4）

| severity | 背景 | 文字 |
|---|---|---|
| info | `bg-blue-50` | `text-blue-700` |
| warning | `bg-amber-50` | `text-amber-700` |
| critical | `bg-red-50` | `text-red-700` |

| status | 背景 | 文字 |
|---|---|---|
| investigating | `bg-rose-100` | `text-rose-800` |
| identified | `bg-orange-100` | `text-orange-800` |
| monitoring | `bg-yellow-100` | `text-yellow-800` |
| resolved | `bg-emerald-100` | `text-emerald-800` |

WCAG 2.1 AA コントラスト比 4.5:1 以上を満たす組合せのみ採用する（CI で `@axe-core/cli` 等によるチェックは Phase B 候補）。

### 5.2 個別ページ `/#/notice/<id>`

- ヘッダ / フッタ: 既存流用
- パンくず: `トップ > 障害情報 > <title>`
- 上部カード: severity / status バッジ / `title` / 開始時刻 / 復旧時刻（あれば）/ 影響サービス全件
- `summary` セクション
- `timeline` セクション: 縦並びの時系列、各エントリは `at`（JST 表示）+ status バッジ + `body`
- 連絡先セクション: `contact.email`（`mailto:` リンク）+ `contact.form_url`（あれば）
- 関連リンク（`related_links` あれば）
- 戻るボタン: `/#/notice` へ

### 5.3 空状態 UI

公開中インシデント 0 件のとき、一覧ページに以下を表示する:

```
✓（emerald-500 アイコン）
現在公開中の障害情報はありません。
過去のインシデント履歴は下記にてご確認いただけます。
```

過去 0 件の場合は履歴セクションも「過去のインシデント履歴はありません」と表示する。

### 5.4 アクセシビリティ要件（WCAG 2.1 AA 最低限）

| 項目 | 実装 |
|---|---|
| ランドマーク | `<header>` / `<nav>`（パンくず）/ `<main>` / `<footer>` を必ず使用 |
| 見出し階層 | `<h1>` → `<h2>` → `<h3>` の順序を守る（飛ばさない） |
| コントラスト | 本文 / バッジ全て 4.5:1 以上（§5.1 表に従う） |
| キーボード操作 | 全リンク / バッジを Tab で到達可能、フォーカスリングを `outline-2 outline-blue-500` で明示 |
| 代替テキスト | 装飾アイコンには `aria-hidden="true"`、状態アイコンには `aria-label` |
| 言語属性 | `<html lang="ja">`（既存 `index.html` を確認、なければ Phase A で追加） |
| 動的更新 | status 変更時に `aria-live="polite"` の領域で告知（Phase B 候補） |

### 5.5 レスポンシブ

- ブレークポイントは既存サイトに合わせ Tailwind デフォルト（`md:`, `lg:`）
- モバイル（< 768px）では timeline を縦 1 列、バッジは見出し直下に配置

---

## 6. 更新フロー

### 6.1 標準フロー（resolved インシデントの追記まで含む）

```
1. 障害発生 → engineering-lead が NOC で状況確認
2. content/notice/incidents/incident-YYYYMMDD-NN.yaml を新規作成
   - 初稿は status=investigating + summary + timeline 1 件
3. ローカルで `npm run build` を実行し schema 検証 + Atom 生成を確認
4. git add → commit → push（main 直接 push 可、または PR レビュー後 merge）
5. GitHub Actions ci.yml が build → actions/deploy-pages@v4 で GitHub Pages 反映
6. Cloudflare proxying 経由で 60 秒以内に CDN 反映
7. 状況更新時は同じ YAML の timeline 配列に追記し、status を更新して再 push
8. 復旧時に status=resolved + resolved_at を追加して最終 push
```

ビルド時間目安: `npm install` 含めて 2〜4 分、Cloudflare CDN 反映 60 秒で **合計 5 分以内** が標準。重大障害時は §6.2 の即時化手順を併用する。

### 6.2 Cloudflare Cache Purge による即時化（critical 時）

severity=critical の場合は標準 60 秒待機を短縮するため、Cloudflare API で対象 URL の cache purge を発行する:

```
purge 対象（critical 時）:
- https://yamada-lab.co.jp/#/notice
- https://yamada-lab.co.jp/notice/incidents.json
- https://yamada-lab.co.jp/notice/feed.xml
- https://yamada-lab.co.jp/#/notice/<id>
```

実行手順は **公式ドキュメント未確認のため推測です。実行前に <https://developers.cloudflare.com/api/operations/zone-purge> で確認してください**。Phase A の運用開始までに以下を確定:

- Cloudflare API token のスコープ最小化（`Cache Purge:Edit` のみ）
- token の保管場所（GitHub Actions secrets / Secret Manager のいずれか）
- 自動化（`severity: critical` を含む YAML 変更時に CI から自動 purge する是非）

詳細は §10 N-1 / Q-1 で扱う。

### 6.3 ロールバック

- 誤公開時は該当 YAML ファイルを削除（または status=resolved + summary に訂正記載）して再 push
- Git 履歴は永続的に残るため、訂正履歴は **timeline 末尾の resolved エントリ内で日本語で説明** する（例: 「N 時 N 分の記載に誤りがあったため修正しました」）。Git rebase / force push は禁止（改ざん耐性確保のため）。

---

## 7. コンテンツ運用ルール

### 7.1 記載禁止事項

以下を本ページに **書かない**。auditor 監査対象とし、CI（pre-build）で機械的にも検出する。

| カテゴリ | 例 | CI 検出パターン（初版） |
|---|---|---|
| 個人特定情報 | 加入者氏名、メール、加入者 ID、MAC アドレス、IMSI | 正規表現: メール `[A-Za-z0-9._%+-]+@`、MAC `([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}` |
| 内部 IP / NW 構成 | プライベート IP（10.0.0.0/8 等）、VM 名、Cloud Run service 名、内部 DNS | 正規表現: `10\.\d`, `192\.168\.`, `noc-web`, `cityroam-proxy-` |
| 社内連絡網 | 担当者個人メール、社内 Slack channel 名、社内電話番号 | 正規表現: `#ai-`, `#cityroam-`, 個人メールドメイン社内ローカル部 |
| 認証情報 | API token、password、private key 断片、IAP client ID | 正規表現: `AIza[0-9A-Za-z_-]{35}`, `-----BEGIN`, `password\s*[:=]` |
| 未確定の原因推測 | 「おそらく〇〇社の障害」等、外部事業者の責任を推断する記述 | 機械検出は不可、§7.3 のレビュー手順で担保 |

### 7.2 推奨記載事項

- 利用者影響（「ログインができない」「速度低下」等の利用者視点の表現）
- 影響範囲（サービス名・地理・時間帯）
- 利用者への暫定回避策（あれば）
- 復旧時刻と恒久対応の方針（再発防止策の概要）
- 連絡先（個別ではなく代表メールアドレス）

### 7.3 起案・承認フロー（v0.1 暫定）

| severity | 起案者 | 承認者 | 公開タイミング |
|---|---|---|---|
| info | engineering-lead | engineering-lead 単独 | 起案後速やかに |
| warning | engineering-lead | engineering-lead + customer-support レビュー | 起案後 30 分以内 |
| critical | engineering-lead | engineering-lead + customer-support + 経営者承認 | 起案後 15 分以内（仮公開後に承認得て本公開も可） |

legal レビューは「外部事業者の責任に言及する場合」「金銭補償・SLA 違反に言及する場合」に限り発動する。確定は §10 Q-2。

---

## 8. 既存サイト統合

### 8.1 ナビゲーション統合

#### ヘッダ（任意・Phase B 検討）

`App.tsx` のヘッダに「障害情報」リンクを追加することは **Phase A では行わない**（経常的なリンクは平常時に意味が薄く、ヘッダ占有コストが高いため）。Phase B で運用実績を見て判断する（§10 Q-2 と併せて）。

#### フッタ（Phase A で必須実装）

既存サイト全ページのフッタに以下リンクを追加する:

```
- プライバシーポリシー
- 障害情報   ← 新規追加（/#/notice へ）
- お問い合わせ（既存）
```

具体的な文言・配置は実装タスクで `App.tsx` および `PrivacyPolicy.tsx` のフッタ共通化を行いながら確定する（共通フッタコンポーネントの抽出は本タスクの実装範囲）。

#### `<head>` Atom リンク

`index.html` の `<head>` に以下を追加し、RSS リーダ / 検索エンジンが Atom を発見できるようにする:

```html
<link rel="alternate" type="application/atom+xml" title="山田ラボ 障害情報" href="/notice/feed.xml" />
```

### 8.2 ルーティング統合

`src/main.tsx` の `<Routes>` に以下 2 行を追加する:

```tsx
<Route path="/notice" element={<NoticeList />} />
<Route path="/notice/:id" element={<NoticeDetail />} />
```

### 8.3 NOC との分離確認

| 項目 | NOC | corp site /notice |
|---|---|---|
| URL | `noc.yamada-lab.co.jp` | `yamada-lab.co.jp/#/notice` |
| 認証 | IAP 全パス保護 | 認証なし（公開） |
| デプロイ | Cloud Run | GitHub Pages |
| データ | BigQuery | Git リポ内 YAML |
| リンク方向 | NOC footer → corp site /notice（一方向） | corp site から NOC への参照は **行わない** |

NOC から corp site への一方向参照のみとし、corp site 側に NOC URL を露出させない（内部システム露出回避）。

---

## 9. 実装タスク（Phase 分割）

### 9.1 Phase A（v0.1 設計承認後・最短実装）

| # | タスク | 担当 | 依存 |
|---|---|---|---|
| A-1 | `content/notice/incidents/` ディレクトリ + サンプル YAML 1 件作成 | software-eng | 設計承認 |
| A-2 | `scripts/build-notice.ts`（YAML → JSON + Atom 変換、schema 検証、機密検出）作成 | software-eng | A-1 |
| A-3 | Vite plugin or `prebuild` script として A-2 を `npm run build` に組込 | software-eng | A-2 |
| A-4 | `src/pages/NoticeList.tsx` / `NoticeDetail.tsx` 実装 | software-eng | A-3 |
| A-5 | `src/main.tsx` にルート追加 + `index.html` に Atom alternate link 追加 | software-eng | A-4 |
| A-6 | 共通フッタコンポーネント抽出 + 「障害情報」リンク追加 | software-eng | A-5 |
| A-7 | 空状態 UI / 既存ページ崩れがないことを目視確認 | test-eng | A-6 |
| A-8 | 機密検出 CI チェックの動作確認（意図的に NG パターンを含む YAML で build fail を確認） | test-eng | A-7 |
| A-9 | 本番 deploy + Cloudflare CDN 反映時間の実測（N-1 解消） | operation-eng | A-8 |
| A-10 | 運用ランブック作成（critical 時の Cache Purge 手順、誤公開時のロールバック手順） | operation-eng | A-9 |

### 9.2 Phase B（運用開始後 1〜2 か月以内）

- WCAG 自動チェック（`@axe-core/cli`）を CI に追加
- ヘッダへの「障害情報」リンク追加是非の判定
- `aria-live` による status 変更告知の実装
- Cloudflare Cache Purge の自動化（critical YAML push 時に CI から自動発火する是非）

### 9.3 Phase C（Phase 3 候補）

- 英語版（i18n、§10 Q-4）
- メール購読 / Slack 連携（§10 Q-3）
- 過去履歴のページネーション（インシデント数増加に備える）
- アクセス解析（GA4 等）
- §6.14 改ざん耐性の追加施策（GPG 署名コミット強制等）の検討

---

## 10. 残課題

### Q（経営者判断 / 業務判断が必要）

- **Q-1**: GitHub Pages → Cloudflare CDN の反映遅延（標準 60 秒〜数分）が §6.14 公知速報性として **加入者影響の大きな critical 障害** の場面で許容されるか。許容しない場合は §6.2 Cloudflare Cache Purge を必須化し、token 管理運用と自動化方針（手動 / CI 自動）を確定する必要がある。
- **Q-2**: コンテンツ起案・承認フロー（§7.3）の確定。特に critical 時に「経営者承認を待つ」のか「engineering-lead 判断で仮公開し事後承認」かの判断。customer-support / legal レビュー必須化の閾値も確定が必要。
- **Q-3**: Atom フィード以外の RSS / メール購読 / Slack 通知の必要性。実装する場合は購読者個人情報を扱うため accounting / legal との整合（個人情報保護規程改訂）が発生する。Phase 2 / Phase 3 のいずれで実装するか。
- **Q-4**: 多言語対応（英語）の必要性とタイミング。Cityroam は eduroam 連携で海外学生が利用するため英語要望は将来発生しうる。Phase 3 で実装する場合の起点（i18n ライブラリ選定 / YAML スキーマ拡張）を v0.2 で確定する。

### N（技術検証 / 実機確認が必要）

- **N-1**: GitHub Pages の Cloudflare proxying 経由で `dist` 成果物が **実測何分で反映されるか** 検証。標準 60 秒でない場合は §6.2 Cache Purge を Phase A で必須化する判断が必要。実測手順は Phase A A-9 で実施。
- **N-2**: Atom フィード生成方式の確定。候補:
  - (a) Vite plugin 自作（型安全だが実装コスト高）
  - (b) `prebuild` で Node script 実行（`tsx scripts/build-notice.ts`、シンプル・本書では (b) を推奨）
  - (c) Astro 等のフレームワーク導入（既存スタック変更を伴うため非推奨）
- **N-3**: 障害情報 YAML schema validator + 機密検出を pre-commit hook で回すか CI のみで回すか。pre-commit は開発者ローカル必須化のため `lefthook` 等の導入要否を Phase A 着手前に判断。
- **N-4**: HashRouter（`/#/notice/<id>`）が SNS（X/Facebook 等）の OGP 取得・検索エンジンインデックスで正しく扱われるか実測。実測結果次第で BrowserRouter 移行を別タスクとして発議する可能性あり（既存サイト全体への影響大のため慎重判断）。
- **N-5**: Cloudflare API による cache purge token のスコープ最小化と保管場所確定。**公式ドキュメント未確認のため推測です。実行前に <https://developers.cloudflare.com/api/operations/zone-purge> で確認してください**。
- **N-6**: 既存 corp site の `<html lang>` 属性の有無確認（未設定なら Phase A で `lang="ja"` 追加）。

---

（以上、v0.1 ドラフト）
