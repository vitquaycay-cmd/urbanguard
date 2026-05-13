import math

from core.routing.osrm.osrm_alternative_fetcher import (
    fetch_alternative_routes,
    fetch_route_with_waypoint,
)
from core.routing.osrm.safe_route_selector import select_safe_route
from core.routing.utils.leaflet_converter import convert_to_leaflet_coords


AVOID_OFFSET_METERS = 700
MAX_DANGERS_TO_AVOID = 4


def _is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _offset_point(lat, lng, bearing_degrees, meters):
    earth_radius = 6378137.0

    bearing = math.radians(bearing_degrees)
    lat1 = math.radians(lat)
    lng1 = math.radians(lng)

    lat2 = math.asin(
        math.sin(lat1) * math.cos(meters / earth_radius)
        + math.cos(lat1) * math.sin(meters / earth_radius) * math.cos(bearing)
    )

    lng2 = lng1 + math.atan2(
        math.sin(bearing) * math.sin(meters / earth_radius) * math.cos(lat1),
        math.cos(meters / earth_radius) - math.sin(lat1) * math.sin(lat2),
    )

    return math.degrees(lat2), math.degrees(lng2)


def _bearing_between(start_lat, start_lng, end_lat, end_lng):
    lat1 = math.radians(start_lat)
    lat2 = math.radians(end_lat)
    diff_lng = math.radians(end_lng - start_lng)

    x = math.sin(diff_lng) * math.cos(lat2)
    y = (
        math.cos(lat1) * math.sin(lat2)
        - math.sin(lat1) * math.cos(lat2) * math.cos(diff_lng)
    )

    bearing = math.degrees(math.atan2(x, y))
    return (bearing + 360) % 360


def _get_candidate_dangers(dangers):
    result = []

    for danger in dangers:
        lat = danger.get("lat")
        lng = danger.get("lng")

        if not _is_number(lat) or not _is_number(lng):
            continue

        result.append(danger)

    return result[:MAX_DANGERS_TO_AVOID]


def _build_waypoint_routes(start_lat, start_lng, end_lat, end_lng, dangers):
    routes = []
    route_bearing = _bearing_between(start_lat, start_lng, end_lat, end_lng)

    candidate_dangers = _get_candidate_dangers(dangers)

    for danger in candidate_dangers:
        danger_lat = danger["lat"]
        danger_lng = danger["lng"]

        for side_bearing in (route_bearing - 90, route_bearing + 90, route_bearing - 135, route_bearing + 135):
            waypoint_lat, waypoint_lng = _offset_point(
                danger_lat,
                danger_lng,
                side_bearing,
                AVOID_OFFSET_METERS,
            )

            try:
                route = fetch_route_with_waypoint(
                    start_lat=start_lat,
                    start_lng=start_lng,
                    waypoint_lat=waypoint_lat,
                    waypoint_lng=waypoint_lng,
                    end_lat=end_lat,
                    end_lng=end_lng,
                )

                if not route:
                    continue

                route["avoidanceWaypoint"] = {
                    "lat": waypoint_lat,
                    "lng": waypoint_lng,
                    "sourceDanger": danger,
                }

                routes.append(route)

            except Exception as e:
                print("Waypoint route failed:", e)

    return routes


def _attach_leaflet_coordinates(route):
    return {
        **route,
        "leafletCoordinates": convert_to_leaflet_coords(route["coordinates"]),
    }


def find_real_safe_route(start_lat, start_lng, end_lat, end_lng, dangers):
    base_routes = fetch_alternative_routes(
        start_lat=start_lat,
        start_lng=start_lng,
        end_lat=end_lat,
        end_lng=end_lng,
    )

    waypoint_routes = _build_waypoint_routes(
        start_lat=start_lat,
        start_lng=start_lng,
        end_lat=end_lat,
        end_lng=end_lng,
        dangers=dangers,
    )

    candidate_routes = base_routes + waypoint_routes

    result = select_safe_route(candidate_routes, dangers)
    selected_route = result["selectedRoute"]

    return {
        "start": {"lat": start_lat, "lng": start_lng},
        "end": {"lat": end_lat, "lng": end_lng},
        "debug": {
            "baseRouteCount": len(base_routes),
            "waypointRouteCount": len(waypoint_routes),
            "candidateRouteCount": len(candidate_routes),
            "dangerCount": len(dangers),
            "selectedDangerPenalty": selected_route["dangerPenalty"],
        },
        "selectedRoute": _attach_leaflet_coordinates(selected_route),
        "allRoutes": result["allRoutes"],
    }