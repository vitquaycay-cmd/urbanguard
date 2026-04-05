import { describe, expect, it } from "vitest";
import {
  closestPointOnSegment,
  distancePointToPolylineMeters,
  haversineM,
  incidentsOnRoute,
  isMarkerNearRoute,
  minDistancePointToPolylineM,
} from "./routingAvoidance";

describe("routingAvoidance", () => {
  it("haversineM: hai điểm trùng ≈ 0", () => {
    const a = { lat: 10.76, lng: 106.66 };
    expect(haversineM(a, a)).toBeLessThan(1);
  });

  it("closestPointOnSegment: P trên đoạn giữa A–B", () => {
    const a = { lat: 10, lng: 106 };
    const b = { lat: 11, lng: 107 };
    const mid = { lat: 10.5, lng: 106.5 };
    const c = closestPointOnSegment(mid, a, b);
    expect(c.lat).toBeCloseTo(10.5, 5);
    expect(c.lng).toBeCloseTo(106.5, 5);
  });

  it("minDistancePointToPolylineM: điểm lệch khỏi đoạn có khoảng cách hữu hạn", () => {
    const poly = [
      { lat: 10.76, lng: 106.65 },
      { lat: 10.77, lng: 106.66 },
    ];
    const p = { lat: 10.8, lng: 106.7 };
    const d = minDistancePointToPolylineM(p, poly);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(50_000);
  });

  it("distancePointToPolylineMeters / isMarkerNearRoute: điểm trên đoạn ≈ 0 m", () => {
    const a = { lat: 10.76, lng: 106.66 };
    const b = { lat: 10.761, lng: 106.661 };
    const poly = [a, b];
    const onSeg = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
    const d = distancePointToPolylineMeters(onSeg, poly);
    expect(d).toBeLessThan(5);
    expect(isMarkerNearRoute(onSeg, poly, 30)).toBe(true);
  });

  it("isMarkerNearRoute: polyline thiếu điểm → false", () => {
    expect(isMarkerNearRoute({ lat: 0, lng: 0 }, null, 30)).toBe(false);
    expect(isMarkerNearRoute({ lat: 0, lng: 0 }, [], 30)).toBe(false);
    expect(isMarkerNearRoute({ lat: 0, lng: 0 }, [{ lat: 1, lng: 1 }], 30)).toBe(
      false,
    );
  });

  it("incidentsOnRoute: lọc theo buffer", () => {
    const poly = [
      { lat: 10, lng: 106 },
      { lat: 10.001, lng: 106.001 },
    ];
    const reports = [
      { id: 1, latitude: 10.0005, longitude: 106.0005, title: "x" },
      { id: 2, latitude: 20, longitude: 120, title: "far" },
    ];
    const near = incidentsOnRoute(reports, poly, 5000);
    expect(near.some((r) => r.id === 1)).toBe(true);
    expect(near.some((r) => r.id === 2)).toBe(false);
  });
});
