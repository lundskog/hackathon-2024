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

const formSchema = z.object({
  gamename: z.string().min(2, {
    message: "Game name must be at least 2 characters.",
  }),
  type: z.union([z.literal("private"), z.literal("public")]),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function CreateGameForm() {
  const { data: session } = useSession();
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }
  }, [api]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gamename: "",
      type: "private",
      username: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <Card className="p-4">
        <div>
          <h1 className="font-semibold">Decks</h1>
          {/* <p className="font-medium text-muted-foreground text-xs">
            Choose which decks to play
          </p> */}
        </div>

        <div className="flex justify-center">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem className="basis-1/3" key={index}>
                  <div className="p-1">
                    <Card className="h-20">
                      <CardContent className="flex items-start p-4 justify-between ">
                        <span className="font-semibold">
                          Deck n. {index + 1}
                        </span>
                        <div className="flex items-end">
                          <Button size={"sm"}>Add</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* <div>
          <h1 className="font-semibold">Popular</h1>
          <p className="font-medium text-muted-foreground text-xs">
            Choose which decks to play
          </p>
        </div> */}
      </Card>
      {/* <Card className="p-4 text-sm text-muted-foreground flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src={session?.user.image ?? undefined} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="flex flex-col font-medium">
            Logged in as{" "}
            <span className="font-semibold text-foreground text-base">
              {session?.user.name}
            </span>
          </div>
        </div>
        <Button size={"sm"}>Change name</Button>
      </Card> */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="gamename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Lilla Västerås" {...field} />
              </FormControl>
              <FormDescription>
                This is your games public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Niels Houben" {...field} />
              </FormControl>
              <FormDescription>
                This will be your name in game.
                {/* If you want to change your name. */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discoverability</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                If you want your game to be discoverable by other players or
                not.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
