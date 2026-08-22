import { treaty } from "@elysiajs/eden";

import { type App, createApp } from "../src/server/app";

// Passing the Elysia instance makes Treaty dispatch via app.handle() — no network needed.
const client = treaty<App>(createApp());

const hit = await client.api.users.search.QUERY({ kind: "byName", name: "Alice" });
console.log("QUERY byName:", hit.status, JSON.stringify(hit.data));

const miss = await client.api.users.search.QUERY({ id: "nope", kind: "byId" });
console.log("QUERY byId miss:", miss.status, JSON.stringify(miss.data));

if (hit.status !== 200 || hit.data?.status !== "ok" || hit.data.users[0]?.name !== "Alice") {
  throw new Error("Eden Treaty QUERY failed");
}
if (miss.data?.status !== "empty") {
  throw new Error("Maybe→Nothing path broken");
}

console.log("✓ Eden Treaty supports the HTTP QUERY method (typed, end to end)");
