from core.routing.osrm.osrm_alternative_fetcher import (
    fetch_alternative_routes
)


routes = fetch_alternative_routes(
    start_lat=12.6797,
    start_lng=108.0440,

    end_lat=12.6808,
    end_lng=108.0490,
)

print(f"Total routes: {len(routes)}")

for index, route in enumerate(routes):

    print(
        f"Route {index + 1}: "
        f"{route['distance']}m"
    )