import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { routeTree } from "./routeTree.gen";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById("root");
// DOM API returns nullable values; the entry point is the one legitimate place to assert.
if (!rootElement) {
  throw new Error("Root element #root is missing in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
