"use client";

/**
 * useUserStore — per-user namespaced storage hook
 *
 * Derives the store directly from the current Clerk userId using useMemo.
 * No effects, no refs-during-render — satisfies the strict React hooks rules.
 *
 * Account isolation: when userId changes (account switch), useMemo returns a
 * new store scoped to the new user. The old store reference is discarded, so
 * stale data from the previous account is never exposed.
 *
 * Legacy migration runs in a separate effect that fires once per userId.
 */

import { useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createUserStore, migrateToUser, type UserStore } from "@/lib/storage/store";

export type UserStoreState =
  | { ready: false; store: null; userId: null }
  | { ready: true; store: UserStore; userId: string };

export function useUserStore(): UserStoreState {
  const { userId, isLoaded } = useAuth();

  // Derive the store synchronously from userId — no setState, no ref access.
  const state = useMemo<UserStoreState>(() => {
    if (!isLoaded || !userId) {
      return { ready: false, store: null, userId: null };
    }
    return { ready: true, store: createUserStore(userId), userId };
  }, [isLoaded, userId]);

  // Run legacy migration once per userId in an effect (side effect only).
  useEffect(() => {
    if (userId) migrateToUser(userId);
  }, [userId]);

  return state;
}
