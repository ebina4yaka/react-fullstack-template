import { Elysia } from "elysia";

import { QuerySchema, type User, searchUsers } from "../shared/user-search";

export type SearchResponse = { status: "ok"; users: readonly User[] } | { status: "empty" };

export function createApp() {
  return new Elysia().route(
    "QUERY",
    "/api/users/search",
    // GET is banned project-wide. Read-with-parameters goes through the HTTP
    // QUERY method (RFC 9110 extension, draft-ietf-httpbis-safe-method-w-body):
    // Safe like GET, but carries a body, so queries stay out of URLs.
    async ({ body }): Promise<SearchResponse> =>
      searchUsers(body).match<SearchResponse>({
        Just: (users) => ({ status: "ok", users }),
        Nothing: () => ({ status: "empty" }),
      }),
    // Valibot schema (Standard Schema V1) — Elysia validates the body and
    // Infers its type; invalid payloads are rejected with 422.
    { body: QuerySchema },
  );
}

export type App = ReturnType<typeof createApp>;
