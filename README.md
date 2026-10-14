# TsumiZare "積戯"

https://tsumizare.app/

Hono・React Server Components・Viteで構築し、Cloudflare Workersへ配信するパズルゲーム。
Bunを開発・ビルド・テストに使う。ルーティングとHTML/Flight変換は
`@yoshikouki/hono-file-router` と `@yoshikouki/hono-rsc-renderer` が担う。

```sh
bun install --frozen-lockfile
bun dev
```

| コマンド | 用途 |
| --- | --- |
| `bun run build` | ゲームライブラリとWorkerのビルド |
| `bun run preview` | ビルドしたWorkerをローカルで実行 |
| `bun run test` | ゲームロジック・React hooksのテスト |
| `bun run test:e2e` | Vite開発環境のブラウザ検証 |
| `bun run test:worker` | 本番ビルドのHTTP・ブラウザ検証 |
| `bun run typecheck` | TypeScriptの型検証 |
| `bun run lint` | 整形と静的検証 |

`src/routes` のHono moduleから `c.render()` を呼ぶ。
ゲーム状態はブラウザ内のReactで持ち、結果画像の保存・共有もブラウザ内で処理する。
メタデータ・manifest・自己ホストのフォントはNext.jsに依存しない。

本番へのpushはGitHub Actionsで検証後、同じ成果物を配信する。
`Production` Environmentに `CLOUDFLARE_API_TOKEN` が必要。
Workerコードと静的アセットはこのリポジトリ、独自ドメインとDNSは
`personal-infra/terraform/cloudflare/tsumizare.tf` が管理する。
Wranglerに独自ドメインやrouteを追加して管理を二重化しない。
`/healthz` で配信中のGit SHAとWorker version IDを確認できる。

初回切替は、Workerを先に配備してPreview URLで検証し、その後Terraformで
Pagesの独自ドメインとCNAMEをWorkers Custom Domainへ移す。
初回Worker作成には `bun run build` と
`bunx wrangler deploy --var "DEPLOYMENT_GIT_SHA:$(git rev-parse HEAD)"` を使う。
Pagesの自動デプロイを無効にしてから移行版をmainへ統合する。
Pagesプロジェクトの削除は切替と復旧確認の後に別途行う。

配信検証は `bun run scripts/smoke-deployment.ts <URL> [Git SHA] [version ID]`。
通常リリースで検証に失敗すると、CIは直前のWorker versionへ戻す。

![App screenshot](/img/screenshot-play.png)

## Custom hook

See: [blocky-game](./packages/blocky-game/)
