from core.routing.osrm.osrm_alternative_fetcher import fetch_alternative_routes
from core.routing.osrm.safe_route_selector import select_safe_route


routes = fetch_alternative_routes(
    start_lat=12.6797,
    start_lng=108.0440,
    end_lat=12.6808,
    end_lng=108.0490,
)

dangers = [
    {
        "lat": 12.6800,
        "lng": 108.0450,
        "type": "accident",
        "penalty": 5000,
    }
]

result = select_safe_route(routes, dangers)

print(result["selectedRoute"]["distance"])
print(result["selectedRoute"]["dangerPenalty"])
print(result["selectedRoute"]["totalCost"])