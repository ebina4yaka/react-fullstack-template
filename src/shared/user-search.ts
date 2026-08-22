import { match } from "ts-pattern";
import { Maybe } from "true-myth";

export interface User {
  readonly id: string;
  readonly name: string;
}

/** Discriminated union shared by client and server instead of loose query params. */
export type Query =
  | { readonly kind: "all" }
  | { readonly kind: "byId"; readonly id: string }
  | { readonly kind: "byName"; readonly name: string };

const USERS: readonly User[] = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Alice II" },
];

/** Absence is modeled with Maybe — a miss returns Nothing, not null/undefined. */
export function searchUsers(query: Query): Maybe<readonly User[]> {
  return match(query)
    .with({ kind: "all" }, () => Maybe.just(USERS))
    .with({ kind: "byId" }, ({ id }) =>
      Maybe.of(USERS.find((user) => user.id === id)).map((user) => [user]),
    )
    .with({ kind: "byName" }, ({ name }) =>
      Maybe.just(USERS.filter((user) => user.name.includes(name))),
    )
    .exhaustive();
}
