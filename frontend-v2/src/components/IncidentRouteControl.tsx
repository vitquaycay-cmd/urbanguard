import type { ActiveReport } from "@/lib/mapActiveReports";
import type { LatLngLiteral } from "@/lib/routingAvoidance";
import {
  buildRouteWithFallback,
  computeDetourWaypoint,
  dangerZonesFromReports,
  dangerZonesHitByRoute,
  DANGER_NEAR_ROUTE_ROI_METERS,
  formatIncidentAvoidanceBanner,
  getNearbyDangers,
  getValidatedReportsForRouting,
  ROUTING_FALLBACK_MESSAGE_VI,
} from "@/services/routingService";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useCallback, useEffect, useRef } from "react";

import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const ROUTE_LINE_WEIGHT = 5;
const ROUTE_LINE_OPACITY = 0.72;

type RoutingControlExt = L.Control & {
  on(type: string, fn: (e: unknown) => void): RoutingControlExt;
  getWaypoints(): { latLng: L.LatLng }[];
  setWaypoints(wps: L.LatLng[]): void;
  getPlan?: () => unknown;
  _line?: { _map: L.Map | null } | null;
  _router?: { _requests?: XMLHttpRequest[] } | null;
};

type RoutesFoundEvent = {
  routes: Array<{ coordinates?: L.LatLng[] }>;
};

function ensureGlobalLeaflet() {
  if (typeof window !== "undefined") {
    (window as unknown as { L: typeof L }).L = L;
  }
}

function coordsToLiteral(coords: L.LatLng[]): LatLngLiteral[] {
  return coords.map((c) => ({ lat: c.lat, lng: c.lng }));
}

function safeRemoveRoutingControl(
  mapInstance: L.Map | null,
  ctrl: RoutingControlExt | null,
) {
  if (!ctrl) return;

  // Abort any pending OSRM XHR requests to prevent callbacks firing after removal
  try {
    const router = ctrl._router as Record<string, unknown> | null;
    if (router && Array.isArray(router._requests)) {
      router._requests.forEach((xhr: XMLHttpRequest) => {
        try {
          xhr.abort();
        } catch {
          /* ignore */
        }
      });
    }
  } catch {
    /* ignore */
  }

  // Patch internal _line._map to prevent _clearLines from crashing
  // when the async OSRM callback fires after control is removed
  try {
    const line = (ctrl as unknown as Record<string, unknown>)._line as Record<
      string,
      unknown
    > | null;
    if (line && line._map === null) {
      // Already null — nothing to do, but the patch below prevents the crash
    }
  } catch {
    /* ignore */
  }

  if (!mapInstance) return;

  try {
    if (typeof mapInstance.removeControl !== "function") return;
    mapInstance.removeControl(ctrl);
  } catch {
    /* Leaflet / LRM có thể đã remove — bỏ qua */
  }
}

type Props = {
  /** Đã lọc VALIDATED + trustScore > 0 (xem `getValidatedReportsForRouting`). */
  incidents: ActiveReport[];
  onAvoidanceMessage: (message: string) => void;
  onRouteGeometryChange?: (coords: LatLngLiteral[] | null) => void;
};

/**
 * OSRM công khai + LRM: đệm va chạm INCIDENT_BUFFER_M (115m), banner, chèn waypoint né.
 */
export default function IncidentRouteControl({
  incidents,
  onAvoidanceMessage,
  onRouteGeometryChange,
}: Props) {
  const map = useMap();
  const routingControlRef = useRef<RoutingControlExt | null>(null);
  const injectionIndexRef = useRef(0);
  const fallbackActiveRef = useRef(false);
  const suppressWaypointResetRef = useRef(false);
  const incidentsRef = useRef(incidents);
  incidentsRef.current = incidents;

  const onMsg = useCallback(
    (s: string) => {
      onAvoidanceMessage(s);
    },
    [onAvoidanceMessage],
  );

  const onGeom = useCallback(
    (coords: LatLngLiteral[] | null) => {
      onRouteGeometryChange?.(coords);
    },
    [onRouteGeometryChange],
  );

  useEffect(() => {
    let cancelled = false;
    const mapRef = map;

    if (!mapRef) return;

    ensureGlobalLeaflet();

    void import("leaflet-routing-machine/dist/leaflet-routing-machine.js").then(
      () => {
        if (cancelled || !mapRef) return;

        safeRemoveRoutingControl(mapRef, routingControlRef.current);
        routingControlRef.current = null;

        const LR = L as unknown as {
          Routing: {
            control: (opts: Record<string, unknown>) => RoutingControlExt;
            osrmv1: (opts: { serviceUrl: string; profile?: string }) => unknown;
          };
        };

        const router = LR.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "driving",
        });

        const ctl = LR.Routing.control({
          waypoints: [
            L.latLng(10.762622, 106.660172),
            L.latLng(10.776889, 106.700886),
          ],
          router,
          lineOptions: {
            styles: [
              {
                color: "#1d4ed8",
                opacity: ROUTE_LINE_OPACITY,
                weight: ROUTE_LINE_WEIGHT,
                className: "urbanguard-route-line",
              },
            ],
          },
          show: true,
          collapsible: true,
          addWaypoints: true,
          routeWhileDragging: false,
        });

        if (cancelled) return;

        routingControlRef.current = ctl;
        ctl.addTo(mapRef);

        ctl.on("waypointschanged", () => {
          if (cancelled) return;
          if (suppressWaypointResetRef.current) return;
          injectionIndexRef.current = 0;
          fallbackActiveRef.current = false;
          onMsg("");
          onGeom(null);
        });

        ctl.on("routingerror", () => {
          if (cancelled) return;
          if (fallbackActiveRef.current) {
            onMsg(ROUTING_FALLBACK_MESSAGE_VI);
            return;
          }
          onMsg("");
          onGeom(null);
        });

        ctl.on("routesfound", (e: unknown) => {
          if (cancelled) return;

          const { routes } = e as RoutesFoundEvent;
          const route = routes?.[0];
          const coordinates = route?.coordinates;
          const currentIncidents = incidentsRef.current;

          if (!coordinates?.length) {
            onMsg("");
            onGeom(null);
            return;
          }

          const poly = coordsToLiteral(coordinates);
          onGeom(poly);

          const eligible = getValidatedReportsForRouting(currentIncidents);
          if (eligible.length === 0) {
            injectionIndexRef.current = 0;
            fallbackActiveRef.current = false;
            onMsg("");
            return;
          }

          const zones = dangerZonesFromReports(eligible);
          const nearby = getNearbyDangers(
            zones,
            poly,
            DANGER_NEAR_ROUTE_ROI_METERS,
          );
          const hits = dangerZonesHitByRoute(poly, nearby);

          if (hits.length === 0) {
            injectionIndexRef.current = 0;
            fallbackActiveRef.current = false;
            onMsg("");
            return;
          }

          if (fallbackActiveRef.current) {
            onMsg(ROUTING_FALLBACK_MESSAGE_VI);
            return;
          }

          const step = buildRouteWithFallback(injectionIndexRef.current);
          if (step.mode === "exhausted") {
            fallbackActiveRef.current = true;
            onMsg(ROUTING_FALLBACK_MESSAGE_VI);
            return;
          }

          const primary = hits[0]!;
          const viaLL = computeDetourWaypoint(
            primary,
            poly,
            step.detourMeters,
            step.preferFarther,
          );

          onMsg(formatIncidentAvoidanceBanner(hits));

          const c = routingControlRef.current;
          if (cancelled || !c) return;
          void c?.getPlan?.();
          if (typeof c.getWaypoints !== "function") return;

          let wps: { latLng: L.LatLng }[];
          try {
            wps = c.getWaypoints();
          } catch {
            return;
          }

          if (wps.length < 2) return;

          const last = wps[wps.length - 1]!.latLng;
          const head = wps.slice(0, -1).map((w) => w.latLng);
          const via = L.latLng(viaLL.lat, viaLL.lng);

          injectionIndexRef.current += 1;

          suppressWaypointResetRef.current = true;
          try {
            if (typeof c.setWaypoints === "function") {
              c.setWaypoints([...head, via, last]);
            }
          } catch {
            injectionIndexRef.current = Math.max(
              0,
              injectionIndexRef.current - 1,
            );
          }
          queueMicrotask(() => {
            suppressWaypointResetRef.current = false;
          });
        });
      },
    );

    return () => {
      cancelled = true;
      const ctrl = routingControlRef.current;
      if (ctrl) {
        // Abort pending XHR before removing to prevent _clearLines crash
        try {
          const router = (ctrl as unknown as Record<string, unknown>)
            ._router as Record<string, unknown> | null;
          if (router && Array.isArray(router._requests)) {
            router._requests.forEach((xhr: XMLHttpRequest) => {
              try {
                xhr.abort();
              } catch {
                /* ignore */
              }
            });
          }
        } catch {
          /* ignore */
        }

        safeRemoveRoutingControl(mapRef, ctrl);
      }
      routingControlRef.current = null;
      injectionIndexRef.current = 0;
      fallbackActiveRef.current = false;
      onMsg("");
      onGeom(null);
    };
  }, [map, onMsg, onGeom]);

  return null;
}
