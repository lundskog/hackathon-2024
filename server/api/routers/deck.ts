import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { cards, decks, insertCardSchema, insertDeckSchema, users } from "@/db/schema";
import { eq } from "drizzle-orm";


export const deckRouter = createTRPCRouter({
  create: protectedProcedure
  .input(insertDeckSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(decks).values(input).catch(err => {
        throw err;
      })
    }),
  get: protectedProcedure
    .input(z.object({
      userId: z.string()
    }).optional()).query(async ({ ctx, input }) => {
      const res = await ctx.db.query.decks.findMany({
        where: eq(decks.creatorId, input?.userId ?? ctx.session.user.id),
        with: {cards: true}
      })
      return res;
    }),
  delete: protectedProcedure
    .input(z.object({
      deckId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db.delete(decks).where(eq(decks.id, input.deckId))
      return res;
    }),
  getOne: protectedProcedure
    .input(z.object({
      deckId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.decks.findFirst({
        where: eq(decks.id, input.deckId),
        with: {
          cards: true
        }
      })
      return res;
    }),
  createCard: protectedProcedure
    .input(insertCardSchema)
    .mutation(async ({ ctx, input: cardValues }) => {
      const res = await ctx.db.insert(cards).values(cardValues)
      return res;
  })

});
