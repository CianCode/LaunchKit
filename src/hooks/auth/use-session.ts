"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type SessionData = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type UserData = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type SessionInfo = {
  user: UserData | null;
  session: SessionData | null;
};

type UseSessionReturn = {
  // Session data
  session: SessionInfo | null;
  isLoading: boolean;
  error: string | null;

  // Session actions
  refreshSession: () => Promise<void>;
  listSessions: () => Promise<SessionData[]>;
  revokeSession: (sessionToken: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;

  // Loading states
  isRefreshing: boolean;
  isListingSessions: boolean;
  isRevokingSession: boolean;
  isRevokingOtherSessions: boolean;

  // Additional errors
  listError: string | null;
  revokeError: string | null;
};

/**
 * Hook for managing user sessions with Better Auth.
 *
 * This hook provides access to the current session and methods to manage
 * all active sessions including listing, refreshing, and revoking sessions.
 *
 * @returns {UseSessionReturn} An object containing session data and management functions
 *
 * @example
 * ```tsx
 * const {
 *   session,
 *   isLoading,
 *   refreshSession,
 *   listSessions,
 *   revokeSession,
 *   revokeOtherSessions
 * } = useSession();
 *
 * // Access current session
 * if (session?.user) {
 *   console.log(`Logged in as: ${session.user.email}`);
 *   console.log(`Session expires: ${session.session?.expiresAt}`);
 * }
 *
 * // List all active sessions
 * const sessions = await listSessions();
 *
 * // Revoke a specific session
 * await revokeSession("session-id-123");
 *
 * // Revoke all other sessions (keep current)
 * await revokeOtherSessions();
 * ```
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isListingSessions, setIsListingSessions] = useState(false);
  const [isRevokingSession, setIsRevokingSession] = useState(false);
  const [isRevokingOtherSessions, setIsRevokingOtherSessions] = useState(false);

  const [listError, setListError] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  /**
   * Fetches the current session data
   */
  const fetchSession = useCallback(async () => {
    try {
      const { data, error: sessionError } = await authClient.getSession();

      if (sessionError) {
        setError(sessionError.message || "Failed to fetch session");
        setSession(null);
        return;
      }

      setSession(data as SessionInfo);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSession(null);
    }
  }, []);

  /**
   * Load session on mount
   */
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      await fetchSession();
      setIsLoading(false);
    };

    loadSession();
  }, [fetchSession]);

  /**
   * Refreshes the current session data.
   *
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await refreshSession();
   * // Session data is now updated
   * ```
   */
  const refreshSession = async () => {
    setIsRefreshing(true);
    await fetchSession();
    setIsRefreshing(false);
  };

  /**
   * Lists all active sessions for the current user.
   *
   * @returns {Promise<SessionData[]>} Array of active sessions
   *
   * @example
   * ```tsx
   * const sessions = await listSessions();
   * sessions.forEach(session => {
   *   console.log(`Session ID: ${session.id}`);
   *   console.log(`Created: ${session.createdAt}`);
   *   console.log(`Expires: ${session.expiresAt}`);
   *   console.log(`IP: ${session.ipAddress}`);
   *   console.log(`Device: ${session.userAgent}`);
   * });
   * ```
   */
  const listSessions = async (): Promise<SessionData[]> => {
    setIsListingSessions(true);
    setListError(null);

    try {
      const { data, error: sessionsError } = await authClient.listSessions();

      if (sessionsError) {
        setListError(sessionsError.message || "Failed to list sessions");
        return [];
      }

      return (data || []) as SessionData[];
    } catch (err) {
      setListError(
        err instanceof Error
          ? err.message
          : "An error occurred while listing sessions"
      );
      return [];
    } finally {
      setIsListingSessions(false);
    }
  };

  /**
   * Revokes a specific session by token.
   *
   * @param {string} sessionToken - The token of the session to revoke
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await revokeSession("session-token-123");
   * // Refresh the session list
   * const sessions = await listSessions();
   * ```
   */
  const revokeSession = async (sessionToken: string) => {
    setIsRevokingSession(true);
    setRevokeError(null);

    try {
      const { error: revokeErr } = await authClient.revokeSession({
        token: sessionToken,
      });

      if (revokeErr) {
        setRevokeError(revokeErr.message || "Failed to revoke session");
        return;
      }

      // Refresh session list after revoking
      await refreshSession();
    } catch (err) {
      setRevokeError(
        err instanceof Error
          ? err.message
          : "An error occurred while revoking session"
      );
    } finally {
      setIsRevokingSession(false);
    }
  };

  /**
   * Revokes all sessions except the current one.
   *
   * This is useful for implementing a "Sign out all other devices" feature.
   *
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * await revokeOtherSessions();
   * // All other sessions have been revoked
   * // Only the current session remains active
   * ```
   */
  const revokeOtherSessions = async () => {
    setIsRevokingOtherSessions(true);
    setRevokeError(null);

    try {
      const { error: revokeErr } = await authClient.revokeOtherSessions();

      if (revokeErr) {
        setRevokeError(revokeErr.message || "Failed to revoke other sessions");
        return;
      }

      // Refresh session after revoking others
      await refreshSession();
    } catch (err) {
      setRevokeError(
        err instanceof Error
          ? err.message
          : "An error occurred while revoking other sessions"
      );
    } finally {
      setIsRevokingOtherSessions(false);
    }
  };

  return {
    session,
    isLoading,
    error,
    refreshSession,
    listSessions,
    revokeSession,
    revokeOtherSessions,
    isRefreshing,
    isListingSessions,
    isRevokingSession,
    isRevokingOtherSessions,
    listError,
    revokeError,
  };
}
