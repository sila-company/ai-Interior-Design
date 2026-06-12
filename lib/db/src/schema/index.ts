import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  originalImagePath: text("original_image_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const redesigns = pgTable("redesigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  styleId: varchar("style_id", { length: 64 }).notNull(),
  resultImagePath: text("result_image_path").notNull(),
  mimeType: varchar("mime_type", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  rooms: many(rooms),
  redesigns: many(redesigns),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  user: one(users, {
    fields: [rooms.userId],
    references: [users.id],
  }),
  redesigns: many(redesigns),
}));

export const redesignsRelations = relations(redesigns, ({ one }) => ({
  room: one(rooms, {
    fields: [redesigns.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [redesigns.userId],
    references: [users.id],
  }),
}));
