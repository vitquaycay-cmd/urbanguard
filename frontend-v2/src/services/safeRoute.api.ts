import axios from "axios";

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_URL || "http://127.0.0.1:5000",
  timeout: 30000,
});

export type DangerPoint = {
  lat: number;
  lng: number;
  type: string;
  penalty: number;
};

export type RealSafeRoutePayload = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  dangers: DangerPoint[];
};

export type SafeRouteDangerPoint = {
  point: [number, number];
  danger: DangerPoint;
  penalty: number;
};

export type SafeRouteSelectedRoute = {
  routeIndex: number;
  distance: number;
  duration: number;
  dangerPenalty: number;
  totalCost: number;
  dangerPoints: SafeRouteDangerPoint[];
  coordinates: [number, number][];
  leafletCoordinates: [number, number][];
};

export type RealSafeRouteResponse = {
  start: {
    lat: number;
    lng: number;
  };

  end: {
    lat: number;
    lng: number;
  };

  selectedRoute: SafeRouteSelectedRoute;

  allRoutes: SafeRouteSelectedRoute[];
};

export async function getRealSafeRoute(
  payload: RealSafeRoutePayload,
): Promise<RealSafeRouteResponse> {
  try {
    console.log("🚨 SEND DANGERS TO AI:", payload.dangers);

    const res = await aiApi.post<RealSafeRouteResponse>(
      "/real-safe-route",
      payload,
    );

    console.log("🛣️ AI SAFE ROUTE RESPONSE:", res.data);

    return res.data;
  } catch (error) {
    console.error("❌ AI safe route API error:", error);
    throw error;
  }
}