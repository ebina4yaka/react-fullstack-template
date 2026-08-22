import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({ component: RootLayout });

function RootLayout() {
  return (
    <>
      <nav className="border-b p-4">
        <Link to="/" className="text-sm font-medium">
          ts-template
        </Link>
      </nav>
      <main className="mx-auto max-w-2xl p-6">
        <Outlet />
      </main>
    </>
  );
}
