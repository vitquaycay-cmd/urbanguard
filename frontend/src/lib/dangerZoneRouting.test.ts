import { describe, expect, it } from "vitest";
import {
  buildRouteWithFallback,
  computeDetourWaypoint,
  dangerZonesHitByRoute,
  formatIncidentAvoidanceBanner,
  generateDetourPoints,
  getNearbyDangers,
  getValidatedReportsForRouting,
  pickDetourWaypoint,
  routeIntersectsDangerZone,
  type DangerZone,
} from "@/services/routingService";

describe("routingService / danger zones", () => {
  it("getValidatedReportsForRouting: loại trustScore = 0", () => {
    const rows = [
      {
        id: 1,
        title: "a",
        description: "",
        latitude: 1,
        longitude: 2,
        imageUrl: null,
        trustScore: 0,
        createdAt: "",
        status: "VALIDATED",
      },
      {
        id: 2,
        title: "b",
        description: "",
        latitude: 1,
        longitude: 2,
        imageUrl: null,
        trustScore: 5,
        createdAt: "",
        status: "VALIDATED",
      },
    ];
    const f = getValidatedReportsForRouting(rows as never);
    expect(f.length).toBe(1);
    expect(f[0]!.id).toBe(2);
  });

  it("getValidatedReportsForRouting: loại trustScore không hợp lệ", () => {
    const base = {
      title: "x",
      description: "",
      latitude: 1,
      longitude: 2,
      imageUrl: null,
      createdAt: "",
      status: "VALIDATED",
    };
    expect(
      getValidatedReportsForRouting([
        { ...base, id: 1, trustScore: NaN },
        { ...base, id: 2, trustScore: "0" as unknown as number },
      ] as never).length,
    ).toBe(0);
  });

  it("routeIntersectsDangerZone + getNearbyDangers", () => {
    const poly = [
      { lat: 10.76, lng: 106.66 },
      { lat: 10.761, lng: 106.661 },
    ];
    const zone: DangerZone = {
      lat: (poly[0]!.lat + poly[1]!.lat) / 2,
      lng: (poly[0]!.lng + poly[1]!.lng) / 2,
      radiusMeters: 80,
      hitRadiusMeters: 115,
    };
    expect(routeIntersectsDangerZone(poly, zone)).toBe(true);
    const near = getNearbyDangers([zone], poly, 5000);
    expect(near.length).toBe(1);
  });

  it("dangerZonesHitByRoute: trả về đúng vùng giao", () => {
    const poly = [
      { lat: 10.76, lng: 106.66 },
      { lat: 10.762, lng: 106.662 },
    ];
    const z0: DangerZone = {
      id: 0,
      lat: poly[0]!.lat,
      lng: poly[0]!.lng,
      radiusMeters: 100,
      hitRadiusMeters: 40,
    };
    const z1: DangerZone = {
      id: 1,
      lat: poly[1]!.lat,
      lng: poly[1]!.lng,
      radiusMeters: 100,
      hitRadiusMeters: 40,
    };
    const hit = dangerZonesHitByRoute(poly, [z1, z0]);
    expect(hit.length).toBe(2);
    expect(hit.map((h) => h.id).sort()).toEqual([0, 1]);
  });

  it("formatIncidentAvoidanceBanner", () => {
    const hits: DangerZone[] = [
      {
        lat: 0,
        lng: 0,
        radiusMeters: 50,
        hitRadiusMeters: 115,
        aiLabels: ["Ổ gà", "Ngập nước"],
      },
    ];
    expect(formatIncidentAvoidanceBanner(hits)).toBe(
      "Đã phát hiện sự cố [Ổ gà, Ngập nước] trên lộ trình, đang điều hướng tránh né",
    );
  });

  it("computeDetourWaypoint khớp generateDetourPoints + pickDetourWaypoint", () => {
    const poly = [
      { lat: 10.76, lng: 106.66 },
      { lat: 10.77, lng: 106.67 },
    ];
    const zone: DangerZone = {
      lat: 10.765,
      lng: 106.665,
      radiusMeters: 50,
      hitRadiusMeters: 115,
    };
    const w = computeDetourWaypoint(zone, poly, 250, true);
    const pair = generateDetourPoints(zone, poly, 250);
    const zc = { lat: zone.lat, lng: zone.lng };
    const w2 = pickDetourWaypoint(pair, zc, true);
    expect(w.lat).toBeCloseTo(w2.lat, 6);
    expect(w.lng).toBeCloseTo(w2.lng, 6);
  });

  it("generateDetourPoints + pickDetourWaypoint", () => {
    const poly = [
      { lat: 10.76, lng: 106.66 },
      { lat: 10.77, lng: 106.67 },
    ];
    const zone: DangerZone = {
      lat: 10.765,
      lng: 106.665,
      radiusMeters: 50,
      hitRadiusMeters: 30,
    };
    const pair = generateDetourPoints(zone, poly, 250);
    const zc = { lat: zone.lat, lng: zone.lng };
    const w = pickDetourWaypoint(pair, zc, true);
    expect(Number.isFinite(w.lat)).toBe(true);
  });

  it("buildRouteWithFallback: sau MAX → exhausted", () => {
    expect(buildRouteWithFallback(0).mode).toBe("inject");
    expect(buildRouteWithFallback(5).mode).toBe("inject");
    expect(buildRouteWithFallback(6).mode).toBe("exhausted");
  });
});
