import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";
import { InferSelectModel, relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { nullable, z } from "zod";
import { sql } from "drizzle-orm";
import { v4 } from "uuid";

export const discoverabilityEnum = pgEnum("discoverability", [
  "public",
  "private",
]);

export const cardTypeEnum = pgEnum("card_type", [
  "white",
  "black",
]);

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  username: text("username").unique(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export const games = pgTable("game", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
});

export const gameUsers = pgTable("game_user", {
  id: text("id").notNull().primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  userId: text("user_id"),
});

export const decks = pgTable("deck", {
  id: text("id").notNull().primaryKey(),
  name: text("title").notNull(),
  creatorId: text("creator_id").notNull(),
  description: text("description"),
  discoverability: discoverabilityEnum("discoverability").notNull().default("private"),
  playCount: integer("play_count").default(0)
});

export const cards = pgTable("card", {
  id: text("id").notNull().primaryKey(),
  cardText: text("card_text").notNull(),
  type: cardTypeEnum("card_type").notNull(),
  deckId: text("deck_id").notNull()
})

export const cardDeckRelations = relations(decks, ({ many, one }) => ({
  cards: many(cards)
}))

export const deckCardRelations = relations(cards, ({ many, one }) => ({
  deck: one(decks,
    {
      fields: [cards.deckId],
      references: [decks.id]
  })
}))

export const insertCardSchema = createInsertSchema(cards);

export const insertDeckSchema = createInsertSchema(decks);