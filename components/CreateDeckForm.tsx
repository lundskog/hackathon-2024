"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { trpc } from "@/app/_trpc/client";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";

const formSchema = z.object({
  deckname: z.string().min(2, {
    message: "Deck name must be at least 2 characters.",
  }),
  type: z.union([z.literal("private"), z.literal("public")]),
});

export function CreateDeckForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const createDeckMutation = trpc.decks.create.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deckname: "",
      type: "private",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (session)
      await createDeckMutation
        .mutateAsync({
          id: v4(),
          name: values.deckname,
          discoverability: values.type,
          creatorId: session.user.id,
        })
        .then(() => {
          router.push("/decks/");
        });
  }

  return (
    <div className="flex gap-8 w-[400px] justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormField
            control={form.control}
            name="deckname"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Deck Name</FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    type="text"
                    className="w-full"
                    placeholder="Stocken X"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your decks display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create</Button>
        </form>
      </Form>
    </div>
  );
}
