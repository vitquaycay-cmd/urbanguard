from core.routing.danger.route_danger_checker import check_route_dangers


def select_safe_route(routes, dangers):
    scored_routes = []

    for index, route in enumerate(routes):
        danger_result = check_route_dangers(
            route["coordinates"],
            dangers,
        )

        total_cost = route["distance"] + danger_result["totalPenalty"]

        scored_routes.append({
            "routeIndex": index,
            "distance": route["distance"],
            "duration": route["duration"],
            "dangerPenalty": danger_result["totalPenalty"],
            "totalCost": total_cost,
            "dangerPoints": danger_result["dangerPoints"],
            "coordinates": route["coordinates"],
        })

    best_route = min(scored_routes, key=lambda r: r["totalCost"])

    return {
        "selectedRoute": best_route,
        "allRoutes": scored_routes,
    }