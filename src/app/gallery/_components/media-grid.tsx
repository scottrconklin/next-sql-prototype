"use client";

import Image from "next/image";
import { api } from "~/trpc/react";

export function MediaGrid() {
  const [items] = api.media.getAll.useSuspenseQuery();

  if (items.length === 0) {
    return (
      <p className="mt-8 text-center text-white/50">
        No images yet. Upload one above!
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-xl bg-white/10">
          <div className="relative aspect-square">
            <Image
              src={item.s3Url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <p className="truncate px-3 py-2 text-sm text-white/70">
            {item.title}
          </p>
        </div>
      ))}
    </div>
  );
}
