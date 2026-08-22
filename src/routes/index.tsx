import { createFileRoute } from "@tanstack/react-router";
import { useField, useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { match } from "ts-pattern";
import * as valibot from "valibot";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { NameSchema, type Query } from "@/shared/user-search";

export const Route = createFileRoute("/")({ component: HomePage });

// Valibot schema doubles as the TanStack Form validator (Standard Schema V1).
// The name constraint is shared with the server (src/shared/user-search.ts).
const SearchSchema = valibot.object({ name: NameSchema });

// React Compiler auto-memoizes this component; no useMemo/useCallback needed.
function HomePage() {
  const queryClient = useQueryClient();

  // The request lives in the mutation and is sent from onSubmit (the official
  // TanStack Form query-integration pattern). Mutation status covers
  // Idle/pending/error/data, so no local state or Suspense is needed.
  // Responses are cached under their request body via fetchQuery, so
  // Repeating a fresh search resolves from cache without a round-trip.
  const search = useMutation({
    mutationFn: (query: Query) =>
      queryClient.fetchQuery({
        queryFn: async () => {
          // HTTP QUERY via Eden Treaty — request/response are typed end to end.
          const res = await api.api.users.search.QUERY(query, {});
          if (res.error) {
            throw res.error;
          }
          return res.data;
        },
        queryKey: ["users", "search", query],
        staleTime: 10_000, // 10 sec
      }),
  });

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => {
      // Use mutate (not mutateAsync): a failure lands in mutation state
      // Instead of rejecting form.handleSubmit.
      void search.mutate(
        value.name === "" ? { kind: "all" } : { kind: "byName", name: value.name },
      );
    },
    validators: {
      // Live validation: typing past the max length shows the error and blocks submit.
      onChange: SearchSchema,
    },
  });
  const nameField = useField({ form, name: "name" });
  // Meta.errors is (issue | undefined)[] — drop the empty slots.
  const nameErrors = nameField.state.meta.errors.flatMap((issue) => (issue ? [issue.message] : []));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">User search via HTTP QUERY</h1>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <Input
          value={nameField.state.value}
          onChange={(event) => nameField.handleChange(event.target.value)}
          placeholder="Search by name…"
        />
        {nameErrors.map((message) => (
          <p key={message} className="text-sm text-destructive">
            {message}
          </p>
        ))}
        <Button type="submit" disabled={search.isPending}>
          Search
        </Button>
      </form>
      {match(search)
        .with({ status: "idle" }, () => (
          <p className="text-muted-foreground">Press Search to send a QUERY request.</p>
        ))
        .with({ status: "pending" }, () => <p className="text-muted-foreground">Searching…</p>)
        .with({ status: "error" }, () => <p className="text-muted-foreground">Search failed.</p>)
        .with({ status: "success" }, ({ data }) =>
          match(data)
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
        )
        .exhaustive()}
    </div>
  );
}
