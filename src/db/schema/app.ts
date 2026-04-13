import { pgTable, serial, text, numeric, timestamp, boolean } from "drizzle-orm/pg-core";

export const properties = pgTable("properties", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    address: text("address").notNull(),
    rentAmount: numeric("rent_amount", { precision: 10, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

export const tenants = pgTable("tenants", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const leases = pgTable("leases", {
    id: serial("id").primaryKey(),
    propertyId: serial("property_id").references(() => properties.id),
    tenantId: serial("tenant_id").references(() => tenants.id),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    monthlyRent: numeric("monthly_rent", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});