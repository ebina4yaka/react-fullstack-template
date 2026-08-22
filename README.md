# ts-template

TypeScript フルスタックテンプレート。

| レイヤー | 技術                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Frontend | React 19 + React Compiler（自動メモ化）+ TanStack Router（ファイルベース）+ Tailwind CSS v4 + shadcn/ui |
| Backend  | ElysiaJS on Bun                                                                                         |
| 言語規約 | true-myth (`Maybe`) / ts-pattern / oxlint（JSプラグイン含む）+ oxfmt                                    |

## セットアップ

```sh
bun install
bun run dev        # api (:3001) と web (:5173) を同時起動
```

```sh
bun run check      # 型チェック (tsc --noEmit)
bun run lint       # oxlint（ネイティブルール + 独自JSプラグイン）
bun run fmt        # oxfmt
bun run build      # 本番ビルド
```

## 構成

```
src/
├── components/ui/   # shadcn コンポーネント (`bunx shadcn@latest add <name>` で追加)
├── routes/          # TanStack Router のファイルベースルート
├── server/          # Elysia アプリ (Bun で実行)
├── shared/          # クライアント/サーバ共用のドメインロジック
└── lib/utils.ts     # cn()
```

## 規約

### null / undefined 禁止

値の欠落は true-myth の `Maybe` で表現する。lint で強制される:

- `unicorn/no-null` — null リテラル禁止
- `no-undefined` — undefined 識別子禁止
- `typescript/no-restricted-types` — `string | undefined` 等の型注釈禁止

```ts
import { Maybe } from "true-myth";

function find(id: string): Maybe<User> {
  return Maybe.of(users.find((u) => u.id === id));
}

find("u1").match({
  Just: (user) => console.log(user.name),
  Nothing: () => console.log("not found"),
});
```

エラーは `Result`（同じく true-myth）で表現する。

### switch 禁止 → ts-pattern

`switch` は独自ルール `project/ban-switch`（oxlint JSプラグイン、`oxlint-plugin.ts`）で禁止。代わりに `ts-pattern` の `match` を使う。
網羅性は `.exhaustive()` でコンパイル時に保証される。

### let 禁止 → const のみ

再代入は独自ルール `project/ban-let` で禁止（単一宣言・分割代入・forループ含む全形式を検知）。
値の変更は `map` / `filter` / `reduce` での派生、または新しい値の生成で表現する。

```ts
// NG
let total = 0;
for (const n of nums) total += n;

// OK
const total = nums.reduce((sum, n) => sum + n, 0);
```

### GET メソッド禁止 → HTTP QUERY

パラメータ付きの読み取りは QUERY メソッド（RFC 9110 拡張 / draft-ietf-httpbis-safe-method-w-body）を使う。
GET のように安全だがボディを持てるため、複雑な検索条件を URL に乗せずに済む。

サーバ側（`src/server/**` では `.get(` 呼び出し自体を lint で禁止）:

```ts
new Elysia().route(
  'QUERY',
  '/api/users/search',
  ({ body }) => /* ... */,
  { body: t.Union([/* TypeBox バリデーション */]) }
)
```

クライアント側:

```ts
fetch("/api/users/search", {
  method: "QUERY",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ kind: "byName", name: "Alice" }),
});
```

書き込みは従来どおり POST/PUT/PATCH/DELETE を使う。

## React Compiler

有効化済み（vite.config.ts の `react({ compiler: true })`）。
`useMemo` / `useCallback` / `React.memo` は原則不要 — 通常の JSX を書けばコンパイラが依存を解析して自動メモ化する。

## shadcn コンポーネントの追加

```sh
bunx shadcn@latest add dialog
```

`components.json` 済みなのでそのまま `src/components/ui/` に入る。
