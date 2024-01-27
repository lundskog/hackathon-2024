import { deckRouter } from "./routers/deck";
import { exampleRouter } from "./routers/example";
import { gameRouter } from "./routers/game";
import { createTRPCRouter, publicProcedure } from "./trpc";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  decks: deckRouter,
  games: gameRouter
});

export type AppRouter = typeof appRouter;
