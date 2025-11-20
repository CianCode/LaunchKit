import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);

export type Status = (typeof statusEnum.enumValues)[number];
