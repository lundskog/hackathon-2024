import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  decksToGames,
  usersToGame,
  games,
  insertGameSchema,
  users,
} from "@/db/schema";
import { v4 } from "uuid";
import { eq } from "drizzle-orm";
import { randomNumbers } from "@/lib/utils";

export const gameRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        game: insertGameSchema,
        selectedDecks: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const words: string[] = await fetch(
        "https://random-word-api.vercel.app/api?words=3"
      ).then((res) => res.json());
      const code = words.join("-") + "-" + randomNumbers(3);
      const { discoverability, name, id } = input.game;
      const selectedDecks = input.selectedDecks;
      await ctx.db.insert(games).values({
        id,
        name,
        code,
        discoverability,
        creatorId: ctx.session.user.id,
      });
      await ctx.db.insert(decksToGames).values(
        selectedDecks.map((deck) => {
          return {
            deckId: deck,
            gameId: id,
          };
        })
      );
      return code;
    }),
  createPlayer: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        nickname: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(usersToGame).values({
        id: v4(),
        gameId: input.gameId,
        nickname: input.nickname,
        userId: ctx.session?.user.id,
      });
    }),
  get: publicProcedure
    .input(
      z.object({
        gameCode: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.games.findFirst({
        where: eq(games.code, input.gameCode),
        with: {
          users: true,
        },
      });
      return res;
    }),
});
