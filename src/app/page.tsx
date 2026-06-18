import { Suspense } from "react";
import Link from "next/link";

import { TodoList } from "~/app/_components/todo-list";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();
  void api.todo.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center gap-8 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight">
            My <span className="text-[hsl(280,100%,70%)]">Todos</span>
          </h1>
          <Suspense fallback={<p className="text-white/50">Loading todos...</p>}>
            <TodoList />
          </Suspense>
          <div className="flex flex-col items-center gap-2">
            {session && (
              <p className="text-sm text-white/50">
                Signed in as {session.user?.name}
              </p>
            )}
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
