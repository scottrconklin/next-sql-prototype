import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const todoRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.todo.findMany({ orderBy: { createdAt: "desc" } });
  }),

  create: publicProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.create({ data: { title: input.title } });
    }),

  toggleComplete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.db.todo.findUniqueOrThrow({
        where: { id: input.id },
      });
      return ctx.db.todo.update({
        where: { id: input.id },
        data: { completed: !todo.completed },
      });
    }),
});
