import { relations } from "drizzle-orm";
import {
  integer,
  boolean,
  jsonb,
  pgTable,
  real,
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
  subscriptionStatus: varchar("subscription_status", { length: 32 })
    .default("none")
    .notNull(),
  subscriptionProductId: varchar("subscription_product_id", { length: 120 }),
  subscriptionExpiresAt: timestamp("subscription_expires_at", {
    withTimezone: true,
  }),
  appleOriginalTransactionId: varchar("apple_original_transaction_id", {
    length: 64,
  }).unique(),
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
  description: text("description"),
  length: real("length"),
  width: real("width"),
  height: real("height"),
  dimensionUnit: varchar("dimension_unit", { length: 10 }),
  budgetAmount: integer("budget_amount"),
  budgetCurrency: varchar("budget_currency", { length: 3 }).default("USD"),
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
  inventoryProducts: jsonb("inventory_products").$type<unknown[]>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: varchar("source_id", { length: 120 }),
  roomType: varchar("room_type", { length: 64 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  title: text("title").notNull(),
  price: real("price"),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  retailer: varchar("retailer", { length: 160 }).notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
  productUrl: text("product_url").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  width: real("width"),
  depth: real("depth"),
  height: real("height"),
  dimensionUnit: varchar("dimension_unit", { length: 10 }).default("in").notNull(),
  color: text("color"),
  material: text("material"),
  styleTags: text("style_tags").default("").notNull(),
  visualDescription: text("visual_description").notNull(),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
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
