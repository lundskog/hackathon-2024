import { z } from "zod";
import "dotenv";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc"; 

import OpenAI from "openai";
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});


export const chatRoute = createTRPCRouter({
  example: publicProcedure //Ändra till privateProcedure sen
    .input(z.object({message: z.string()}))
    .mutation(async ({ input }) => {
      const completion = await openai.chat.completions.create({
        messages: [{"role": "system", "content": input.message}],
        model: "gpt-3.5-turbo",
      });

      return completion.choices[0].message.content;
    }),
});