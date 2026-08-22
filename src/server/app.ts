import { Elysia, t } from "elysia";

import { type Query, type User, searchUsers } from "../shared/user-search";

export type SearchResponse = { status: "ok"; users: readonly User[] } | { status: "empty" };

export function createApp() {
  return new Elysia().route(
    "QUERY",
    "/api/users/search",
    // GET is banned project-wide. Read-with-parameters goes through the HTTP
    // QUERY method (RFC 9110 extension, draft-ietf-httpbis-safe-method-w-body):
    // Safe like GET, but carries a body, so queries stay out of URLs.
    ({ body }): SearchResponse => {
      const query: Query = body;
      return searchUsers(query).match<SearchResponse>({
        Just: (users) => ({ status: "ok", users }),
        Nothing: () => ({ status: "empty" }),
      });
    },
    {
      body: t.Union([
        t.Object({ kind: t.Literal("all") }),
        t.Object({ id: t.String(), kind: t.Literal("byId") }),
        t.Object({ kind: t.Literal("byName"), name: t.String() }),
      ]),
    },
  );
}
