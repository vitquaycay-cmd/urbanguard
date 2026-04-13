/**
 * @deprecated Import từ `@/services/routingService` — file này giữ tương thích re-export.
 */

export {
  type DangerZone,
  dangerZonesFromReports,
  dangerZonesHitByRoute,
  routeIntersectsDangerZone,
  segmentIndexClosestToPoint,
} from "@/services/routingService";

/** Alias tên cũ. */
export { dangerZonesFromReports as dangerZonesFromActiveReports } from "@/services/routingService";
