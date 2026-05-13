from core.routing.utils.haversine import haversine_distance
from core.routing.danger.proximity_checker import is_near_danger
from core.routing.cost.danger_penalty import get_danger_penalty


def calculate_edge_cost(
    start_lat,
    start_lng,
    end_lat,
    end_lng,
    dangers,
):
    """
    Tính cost của 1 edge
    """

    # khoảng cách thật
    distance = haversine_distance(
        start_lat,
        start_lng,
        end_lat,
        end_lng,
    )

    total_penalty = 0

    for danger in dangers:

        check = is_near_danger(
            route_lat=end_lat,
            route_lng=end_lng,

            danger_lat=danger["lat"],
            danger_lng=danger["lng"],

            danger_type=danger["type"],
        )

        if check["isDanger"]:
            penalty = get_danger_penalty(
                danger["severity"]
            )

            total_penalty += penalty

    total_cost = distance + total_penalty

    return {
        "distance": distance,
        "penalty": total_penalty,
        "totalCost": total_cost,
    }