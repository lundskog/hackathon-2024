import { deckRouter } from "./routers/deck";
import { exampleRouter } from "./routers/example";
import { createTRPCRouter, publicProcedure } from "./trpc";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  decks: deckRouter
});

export type AppRouter = typeof appRouter;
