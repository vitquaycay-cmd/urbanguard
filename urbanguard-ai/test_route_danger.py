from core.routing.osrm.osrm_fetcher import fetch_route
from core.routing.danger.route_danger_checker import check_route_dangers


route = fetch_route(
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

result = check_route_dangers(
    route["coordinates"],
    dangers,
)

print(result)