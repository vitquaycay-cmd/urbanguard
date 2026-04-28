import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { getUnreadNotificationsCount } from "@/services/auth.api";

export function useUnreadCount(userId: number | undefined) {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    const c = await getUnreadNotificationsCount();
    setCount(c);
  }, []);

  useEffect(() => {
    void fetchCount();

    if (!userId) return;

    const socket = io(`${getApiBaseUrl().replace("/api", "")}/realtime`, {
      query: { userId: String(userId) },
      transports: ["websocket"],
    });

    socket.on("notification:new", () => {
      void fetchCount();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, fetchCount]);

  return count;
}
