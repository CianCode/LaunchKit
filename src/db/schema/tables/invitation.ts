import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { roleEnum } from "../enums/role";
import { statusEnum } from "../enums/status";
import { organization } from "./organization";
import { user } from "./user";

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: roleEnum("role"),
  status: statusEnum("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
