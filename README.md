# 山田ラボ合同会社 コーポレートサイト

[山田ラボ合同会社（Yamada Lab LLC）](https://www.yamada-lab.co.jp/) のコーポレートサイト。

## 技術スタック

- React 19 + Vite 6
- TypeScript 5
- Tailwind CSS 4
- React Router 7（HashRouter）
- GitHub Pages デプロイ + Cloudflare CDN

## ローカル開発

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド (dist/)
npm run preview  # 本番ビルドの確認
npm run lint     # tsc --noEmit
npm run accessibility:check  # axe-core (要 Chrome)
```

## ディレクトリ構成

```
src/                React コンポーネント (App / NoticeList / NoticeDetail / PrivacyPolicy)
content/notice/     障害情報 YAML (build 時に静的生成)
scripts/            ビルドスクリプト (build-notice / run-axe)
public/             静的アセット
```

## ライセンス

Copyright © 山田ラボ合同会社 All Rights Reserved.
