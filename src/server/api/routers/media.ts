import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const mediaRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.mediaItem.findMany({ orderBy: { createdAt: "desc" } });
  }),

  getPresignedUrl: publicProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string().regex(/^image\//),
      }),
    )
    .mutation(async ({ input }) => {
      const key = `uploads/${Date.now()}-${input.filename}`;
      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key,
        ContentType: input.contentType,
      });
      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
      const s3Url = `${env.NEXT_PUBLIC_S3_BUCKET_URL}/${key}`;
      return { presignedUrl, key, s3Url };
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        s3Key: z.string().min(1),
        s3Url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mediaItem.create({
        data: {
          title: input.title,
          s3Key: input.s3Key,
          s3Url: input.s3Url,
        },
      });
    }),
});
