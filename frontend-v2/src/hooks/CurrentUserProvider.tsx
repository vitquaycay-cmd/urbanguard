import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AuthApiError,
  clearStoredTokens,
  getMeRequest,
} from "@/services/auth.api";
import {
  CurrentUserContext,
  type CurrentUser,
} from "@/hooks/currentUserContext";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Shared by login and any future token refresh flow to sync local auth state.
  const refreshUser = useCallback(async () => {
    try {
      const nextUser = await getMeRequest();
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      if (
        error instanceof AuthApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        // Only auth failures clear tokens; transient network/server errors keep the session intact.
        clearStoredTokens();
      }

      setUser(null);
      return null;
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Bootstrap once on app load without updating state after unmount.
    async function loadCurrentUser() {
      try {
        const nextUser = await getMeRequest();
        if (!cancelled) setUser(nextUser);
      } catch (error) {
        if (
          error instanceof AuthApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          // A rejected /auth/me means the stored token is no longer usable.
          clearStoredTokens();
        }

        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{ user, loading, refreshUser, clearUser }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}
