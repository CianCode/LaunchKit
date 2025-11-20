import { headers } from "next/headers";
import type { Role } from "@/db/schema/enums/role";
import { auth } from "@/lib/auth";

/**
 * Get the current authenticated user session
 * @returns The user session or null if not authenticated
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Check if the user is authenticated
 * @returns true if the user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Require the user to be authenticated
 * @throws Error if the user is not authenticated
 * @returns The authenticated user session
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}

/**
 * Check if the user has a specific role
 * @param role - The role to check for
 * @returns true if the user has the specified role, false otherwise
 */
export async function hasRole(role: Role): Promise<boolean> {
  const session = await getSession();

  if (!session?.user) {
    return false;
  }

  return session.user.role === role;
}

/**
 * Check if the user has any of the specified roles
 * @param roles - Array of roles to check for
 * @returns true if the user has any of the specified roles, false otherwise
 */
export async function hasAnyRole(roles: Role[]): Promise<boolean> {
  const session = await getSession();

  if (!session?.user) {
    return false;
  }

  return roles.includes(session.user.role as Role);
}

/**
 * Require the user to have a specific role
 * @param role - The role required
 * @throws Error if the user doesn't have the required role
 * @returns The authenticated user session
 */
export async function requireRole(role: Role) {
  const session = await requireAuth();

  if (session.user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }

  return session;
}

/**
 * Require the user to have any of the specified roles
 * @param roles - Array of roles, user must have at least one
 * @throws Error if the user doesn't have any of the required roles
 * @returns The authenticated user session
 */
export async function requireAnyRole(roles: Role[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role as Role)) {
    throw new Error(`Forbidden: One of [${roles.join(", ")}] roles required`);
  }

  return session;
}

/**
 * Check if the user is an admin
 * @returns true if the user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole("admin");
}

/**
 * Check if the user is an owner
 * @returns true if the user is an owner, false otherwise
 */
export async function isOwner(): Promise<boolean> {
  return await hasRole("owner");
}

/**
 * Require the user to be an admin
 * @throws Error if the user is not an admin
 * @returns The authenticated admin user session
 */
export async function requireAdmin() {
  return await requireRole("admin");
}

/**
 * Require the user to be an owner
 * @throws Error if the user is not an owner
 * @returns The authenticated owner user session
 */
export async function requireOwner() {
  return await requireRole("owner");
}

/**
 * Check if the user is banned
 * @returns true if the user is banned, false otherwise
 */
export async function isBanned(): Promise<boolean> {
  const session = await getSession();

  if (!session?.user) {
    return false;
  }

  // Check if user is banned and ban hasn't expired
  if (session.user.banned) {
    if (!session.user.banExpires) {
      return true; // Permanently banned
    }

    const now = new Date();
    const banExpiry = new Date(session.user.banExpires);
    return now < banExpiry; // Still banned if current time is before expiry
  }

  return false;
}

/**
 * Require the user to not be banned
 * @throws Error if the user is banned
 * @returns The authenticated user session
 */
export async function requireNotBanned() {
  const session = await requireAuth();

  if (await isBanned()) {
    const banReason = session.user.banReason || "No reason provided";
    throw new Error(`Account banned: ${banReason}`);
  }

  return session;
}
