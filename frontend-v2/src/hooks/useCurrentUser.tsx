import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getMeRequest, type MeUser } from "@/services/auth.api";

/** Thông tin user từ GET /api/auth/me — đồng bộ với MeUser */
export type CurrentUser = MeUser;

type CurrentUserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
};

const CurrentUserContext = createContext<
  CurrentUserContextValue | undefined
>(undefined);

/** Gọi GET /api/auth/me một lần; bọc quanh AppShell (hoặc route có layout). */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeRequest()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CurrentUserContext.Provider value={{ user, loading }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (ctx === undefined) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return ctx;
}