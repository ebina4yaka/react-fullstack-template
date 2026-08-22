import { match } from "ts-pattern";
import { Maybe } from "true-myth";
import * as valibot from "valibot";

export interface User {
  readonly id: string;
  readonly name: string;
}

/** Single source of truth for the name constraint — used by client form and server body schema. */
const MAX_NAME_LENGTH = 50;
export const NameSchema = valibot.pipe(
  valibot.string(),
  valibot.maxLength(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
);

/** Discriminated union shared by client and server instead of loose query params. */
export const QuerySchema = valibot.variant("kind", [
  valibot.object({ kind: valibot.literal("all") }),
  valibot.object({ id: valibot.string(), kind: valibot.literal("byId") }),
  valibot.object({ kind: valibot.literal("byName"), name: NameSchema }),
]);

export type Query = valibot.InferOutput<typeof QuerySchema>;

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
