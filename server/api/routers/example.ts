import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { users } from "@/db/schema";


export const exampleRouter = createTRPCRouter({
  example: publicProcedure
    .mutation(async ({ ctx }) => {
      console.log(ctx.session?.user.name)
      return "testing"
    }),
});
