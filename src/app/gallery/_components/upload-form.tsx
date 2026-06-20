"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";

type UploadStatus = "idle" | "uploading" | "saving" | "done" | "error";

export function UploadForm() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = api.useUtils();

  const getPresignedUrl = api.media.getPresignedUrl.useMutation();
  const createMedia = api.media.create.useMutation({
    onSuccess: async () => {
      await utils.media.invalidate();
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) return;

    try {
      setStatus("uploading");

      // Step 1: get presigned URL from server (AWS creds never leave server)
      const { presignedUrl, key, s3Url } =
        await getPresignedUrl.mutateAsync({
          filename: file.name,
          contentType: file.type,
        });

      // Step 2: upload binary directly to S3 (bypasses Next.js server)
      const res = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("S3 upload failed");

      // Step 3: save metadata to SQL Server via tRPC
      setStatus("saving");
      await createMedia.mutateAsync({ title: title.trim(), s3Key: key, s3Url });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const isPending = status === "uploading" || status === "saving";

  const buttonLabel =
    status === "uploading"
      ? "Uploading to S3..."
      : status === "saving"
        ? "Saving..."
        : status === "done"
          ? "Done!"
          : "Upload";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        placeholder="Image title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded-full bg-white/10 px-4 py-2 text-white placeholder-white/40 outline-none focus:bg-white/20"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="text-sm text-white/70 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-purple-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-400"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-purple-500 px-6 py-2 font-semibold text-white transition hover:bg-purple-400 disabled:opacity-50"
      >
        {buttonLabel}
      </button>
      {status === "error" && (
        <p className="self-center text-sm text-red-400">
          Upload failed — check console.
        </p>
      )}
    </form>
  );
}
