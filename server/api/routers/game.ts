import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { users } from "@/db/schema";

export const gameRouter = createTRPCRouter({
  create: publicProcedure.input().mutation(async ({ ctx }) => {}),
});
