import { createContext } from "react";
import type { MeUser } from "@/services/auth.api";

export type CurrentUser = MeUser;

export type CurrentUserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  /** Refetch /auth/me after token changes, especially immediately after login. */
  refreshUser: () => Promise<CurrentUser | null>;
  /** Clear in-memory user state when local tokens are removed. */
  clearUser: () => void;
};

export const CurrentUserContext = createContext<
  CurrentUserContextValue | undefined
>(undefined);
