"use client";

/**
 * UserStoreContext — React context that exposes the per-user namespaced store.
 *
 * Wrap the workspace layout with <UserStoreProvider>.
 * Consume with useStore() in any client component.
 *
 * useStore() returns null while the user is loading or signed out; callers
 * should treat null as "not ready" and avoid reading or writing storage.
 */

import React, { createContext, useContext } from "react";
import type { UserStore } from "@/lib/storage/store";
import { useUserStore } from "@/hooks/useUserStore";

const UserStoreContext = createContext<UserStore | null>(null);

export function UserStoreProvider({ children }: { children: React.ReactNode }) {
  const state = useUserStore();
  return (
    <UserStoreContext.Provider value={state.ready ? state.store : null}>
      {children}
    </UserStoreContext.Provider>
  );
}

/**
 * Returns the current user's store, or null when not yet ready.
 * Must be used inside <UserStoreProvider>.
 */
export function useStore(): UserStore | null {
  return useContext(UserStoreContext);
}
