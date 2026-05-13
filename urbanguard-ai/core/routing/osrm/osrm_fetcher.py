import requests


OSRM_BASE_URL = "https://router.project-osrm.org"


def fetch_route(start_lat, start_lng, end_lat, end_lng):
    """
    Lấy route thật từ OSRM.
    Lưu ý OSRM dùng thứ tự: lng,lat
    """

    url = (
        f"{OSRM_BASE_URL}/route/v1/driving/"
        f"{start_lng},{start_lat};{end_lng},{end_lat}"
        f"?overview=full&geometries=geojson"
    )

    response = requests.get(url, timeout=15)
    response.raise_for_status()

    data = response.json()

    if data.get("code") != "Ok":
        raise Exception(f"OSRM error: {data}")

    route = data["routes"][0]

    return {
        "distance": route["distance"],
        "duration": route["duration"],
        "coordinates": route["geometry"]["coordinates"],
    }