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

export const gameDiscoverabilityEnum = pgEnum("game_discoverability", [
  "public",
  "private",
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

export const decks = pgTable("deck", {
  id: text("id").notNull().primaryKey(),
  name: text("title"),
  description: text("description"),
});

export const gameUser = pgTable("game_user", {
  id: text("id").notNull().primaryKey(),
  gameId: text("game_id"),
  name: text("name"),
  userId: text(""),
});
