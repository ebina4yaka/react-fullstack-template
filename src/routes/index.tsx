import { createFileRoute } from "@tanstack/react-router";
import { match } from "ts-pattern";
import { Maybe } from "true-myth";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { SearchResponse } from "@/server/app";

export const Route = createFileRoute("/")({ component: HomePage });

// React Compiler auto-memoizes this component; no useMemo/useCallback needed.
function HomePage() {
  const [name, setName] = useState("");
  const [response, setResponse] = useState<Maybe<SearchResponse>>(Maybe.nothing());

  async function handleSearch() {
    const body = name === "" ? { kind: "all" as const } : { kind: "byName" as const, name };
    // HTTP QUERY via Eden Treaty — request/response are typed end to end.
    const { data } = await api.api.users.search.QUERY(body);
    setResponse(Maybe.of(data));
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">User search via HTTP QUERY</h1>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSearch();
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Search by name…"
        />
        <Button type="submit">Search</Button>
      </form>
      {response.match({
        Just: (result) =>
          match(result)
            .with({ status: "ok" }, ({ users }) => (
              <ul className="list-disc pl-6">
                {users.map((user) => (
                  <li key={user.id}>{user.name}</li>
                ))}
              </ul>
            ))
            .with({ status: "empty" }, () => (
              <p className="text-muted-foreground">No users found.</p>
            ))
            .exhaustive(),
        Nothing: () => (
          <p className="text-muted-foreground">Press Search to send a QUERY request.</p>
        ),
      })}
    </div>
  );
}
