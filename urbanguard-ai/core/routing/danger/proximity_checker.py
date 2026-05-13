from core.routing.utils.haversine import haversine_distance
from core.routing.danger.danger_radius import get_danger_radius


def is_near_danger(
    route_lat,
    route_lng,
    danger_lat,
    danger_lng,
    danger_type,
):
    """
    Kiểm tra route point có nằm gần danger không
    """

    distance = haversine_distance(
        route_lat,
        route_lng,
        danger_lat,
        danger_lng,
    )

    radius = get_danger_radius(danger_type)

    return {
        "distance": distance,
        "radius": radius,
        "isDanger": distance <= radius,
    }