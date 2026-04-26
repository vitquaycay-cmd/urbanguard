import { useEffect } from "react";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { getStoredAccessToken } from "@/services/auth.api";

export function useBannedSocket(
  userId: number | undefined,
  onBanned: () => void,
) {
  useEffect(() => {
    if (!userId) return;

    const socket = io(`${getApiBaseUrl().replace("/api", "")}/realtime`, {
      query: { userId: String(userId) },
      auth: { token: getStoredAccessToken() },
      transports: ["websocket"],
    });

    socket.on("account:banned", () => {
      onBanned();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
