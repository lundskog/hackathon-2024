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

export const listTypeEnum = pgEnum("list_type", ["tiers", "individual"]);

export const listDiscoverabilityEnum = pgEnum("list_discoverability", [
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

export const usersRelations = relations(users, ({ many }) => ({
  lists: many(lists),
}));

export const routines = pgTable(
  "routine",
  {
    id: text("id").notNull().primaryKey(),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => ({
    unq: unique("unique_title_per_user").on(t.createdByUserId, t.title),
  })
);

export const lists = pgTable(
  "list",
  {
    id: text("id").notNull().primaryKey(),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    type: listTypeEnum("list_type").notNull(),
    discoverability: listDiscoverabilityEnum("list_discoverability").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => ({
    unq: unique("unique_title_per_user").on(t.userId, t.title),
  })
);

export const routinesRelations = relations(routines, ({ many, one }) => ({}));

export const listsRelations = relations(lists, ({ many, one }) => ({
  entries: many(listEntries),
  user: one(users, {
    fields: [lists.userId],
    references: [users.id],
  }),
}));

export const objectives = pgTable("objective", {
  id: text("id").notNull().primaryKey(),
  title: text("title").notNull(),
});

export const listEntries = pgTable("listEntry", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  imgUrl: text("imgUrl"),
  listId: text("list_id").notNull(),
});

export const listEntryRelations = relations(listEntries, ({ one }) => ({
  list: one(lists, {
    fields: [listEntries.listId],
    references: [lists.id],
  }),
}));

export const competitions = pgTable("competition", {
  id: text("id").notNull().primaryKey(),
  title: text("title").notNull(),
});

export const insertListSchema = createInsertSchema(lists, {
  id: z.optional(z.string()),
  userId: z.optional(z.string()),
});

export const insertEntrySchema = createInsertSchema(listEntries);

export type UserList = InferSelectModel<typeof lists>;
export type UserListEntries = InferSelectModel<typeof listEntries>;
