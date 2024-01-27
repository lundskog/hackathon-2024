"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent } from "@/components/ui/card";

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
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  gamename: z.string().min(2, {
    message: "Game name must be at least 2 characters.",
  }),
  type: z.union([z.literal("private"), z.literal("public")]),
  nickname: z.string().min(2, {
    message: "Nickname must be at least 2 characters.",
  }),
});

export function CreateGameForm() {
  const { data: session } = useSession();
  const { data: myDecks } = trpc.decks.get.useQuery();
  const createGameMutation = trpc.games.create.useMutation();
  const createPlayerMutation = trpc.games.createPlayer.useMutation();
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const router = useRouter();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gamename: "",
      type: "private",
      nickname: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const id = v4();
    await createGameMutation
      .mutateAsync({ id, discoverability: values.type, name: values.gamename })
      .then(async (code) => {
        console.log("game created");
        await createPlayerMutation
          .mutateAsync({ gameId: id, nickname: values.nickname })
          .then(() => {
            console.log("player created");
            router.push(`/games/${code}`);
          });
      });
  }

  return (
    <div className="flex gap-8">
      <div>
        <Form {...form}>
          {/* <div className="flex justify-center">
            <Carousel
              opts={{
                align: "start",
              }}
              setApi={setApi}
            >
              <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem
                    className="grow flex-shrink-0 w-20 basis-2/3"
                    key={index}
                  >
                    <div className="p-1">
                      <Card className="h-20 shadow-none">
                        <CardContent className="flex items-start p-4 justify-between ">
                          <span className="font-semibold">
                            Deck {index + 1}
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
          </div> */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gamename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Name</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      type="text"
                      placeholder="Lilla Västerås"
                      {...field}
                    />
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
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Niels Houben" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be your in-game name.
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem disabled value="public">
                        Public
                      </SelectItem>
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
      </div>

      <div className="flex flex-col gap-2">
        <div className="space-y-2">
          <div className="flex flex-col">
            <h1 className="font-semibold text-2xl">Decks</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Select the decks you want to play with.
            </p>
          </div>
          <div className="flex justify-between">
            <Link href={"/decks/create"}>
              <Button size={"sm"} className="font-semibold">
                New deck
              </Button>
            </Link>
            <div className="flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session?.user.image ?? undefined} />
                <AvatarFallback></AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-xs text-muted-foreground font-medium">
                Logged in as{" "}
                <span className="font-semibold text-foreground">
                  {session?.user.name}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 max-h-[400px] overflow-scroll">
          {myDecks?.map((deck, index) => {
            const whiteCards = deck.cards.filter(
              (card) => card.type === "white"
            );
            const blackCards = deck.cards.filter(
              (card) => card.type === "black"
            );
            return (
              <Card
                style={{
                  animationDelay: index * 50 + "ms",
                }}
                className="p-4 space-y-2 animate-fadeIn-up opacity-0 relative"
                key={deck.id}
              >
                <div className="flex rounded-md overflow-hidden">
                  <div className="flex flex-col bg-white text-black text-xs p-2 w-[120px] whitespace-nowrap overflow-hidden">
                    {whiteCards.map((card, index) => {
                      if (index < 3) {
                        return (
                          <span
                            key={card.id}
                            className="text-ellipsis overflow-hidden"
                          >
                            {card.cardText}
                          </span>
                        );
                      }
                    })}
                  </div>
                  <div className="flex flex-col bg-black text-white text-xs p-2 w-[120px] whitespace-nowrap overflow-hidden">
                    {blackCards.map((card, index) => {
                      if (index < 3) {
                        return (
                          <span
                            key={card.id}
                            className="text-ellipsis overflow-hidden whitespace-nowrap"
                          >
                            {card.cardText}
                          </span>
                        );
                      }
                    })}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="font-semibold text-xl whitespace-nowrap">
                      {deck.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      W: {whiteCards.length}, B: {blackCards.length}
                    </p>
                  </div>
                  {selectedDecks.includes(deck.id) ? (
                    <Button
                      variant={"destructive"}
                      onClick={() => {
                        setSelectedDecks((decks) => {
                          return decks.filter((d) => d !== deck.id);
                        });
                      }}
                      size="sm"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedDecks((decks) => {
                          if (!decks.includes(deck.id)) {
                            return [...decks, deck.id];
                          }
                          return decks;
                        });
                      }}
                      size="sm"
                    >
                      Use
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
