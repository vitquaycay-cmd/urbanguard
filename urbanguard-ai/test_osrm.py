from core.routing.osrm.osrm_fetcher import fetch_route

result = fetch_route(
    start_lat=12.6797,
    start_lng=108.0440,
    end_lat=12.6808,
    end_lng=108.0490,
)

print("Distance:", result["distance"])
print("Duration:", result["duration"])
print("First point:", result["coordinates"][0])
print("Total points:", len(result["coordinates"]))