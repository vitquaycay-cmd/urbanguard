import { useContext } from "react";
import { CurrentUserContext } from "@/hooks/currentUserContext";

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (ctx === undefined) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return ctx;
}
