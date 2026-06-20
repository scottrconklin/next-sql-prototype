import { Suspense } from "react";
import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";
import { MediaGrid } from "~/app/gallery/_components/media-grid";
import { UploadForm } from "~/app/gallery/_components/upload-form";

export default async function GalleryPage() {
  void api.media.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-5xl font-extrabold tracking-tight">
              Media <span className="text-[hsl(280,100%,70%)]">Gallery</span>
            </h1>
            <Link
              href="/"
              className="text-sm text-white/50 transition hover:text-white"
            >
              ← Back to Todos
            </Link>
          </div>
          <UploadForm />
          <Suspense
            fallback={
              <p className="mt-8 text-white/50">Loading images...</p>
            }
          >
            <MediaGrid />
          </Suspense>
        </div>
      </main>
    </HydrateClient>
  );
}
