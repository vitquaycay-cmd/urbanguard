import requests


OSRM_BASE_URL = "https://router.project-osrm.org"


def _parse_routes(data):
    if data.get("code") != "Ok":
        raise Exception(f"OSRM error: {data}")

    routes = []

    for route in data["routes"]:
        routes.append({
            "distance": route["distance"],
            "duration": route["duration"],
            "coordinates": route["geometry"]["coordinates"],
        })

    return routes


def fetch_alternative_routes(
    start_lat,
    start_lng,
    end_lat,
    end_lng,
):
    url = (
        f"{OSRM_BASE_URL}/route/v1/driving/"
        f"{start_lng},{start_lat};{end_lng},{end_lat}"
        f"?alternatives=true"
        f"&overview=full"
        f"&geometries=geojson"
    )

    response = requests.get(url, timeout=15)
    response.raise_for_status()

    return _parse_routes(response.json())


def fetch_route_with_waypoint(
    start_lat,
    start_lng,
    waypoint_lat,
    waypoint_lng,
    end_lat,
    end_lng,
):
    url = (
        f"{OSRM_BASE_URL}/route/v1/driving/"
        f"{start_lng},{start_lat};"
        f"{waypoint_lng},{waypoint_lat};"
        f"{end_lng},{end_lat}"
        f"?alternatives=false"
        f"&overview=full"
        f"&geometries=geojson"
    )

    response = requests.get(url, timeout=15)
    response.raise_for_status()

    routes = _parse_routes(response.json())

    if not routes:
        return None

    return routes[0]