import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin", "member", "owner"]);

export type Role = (typeof roleEnum.enumValues)[number];
