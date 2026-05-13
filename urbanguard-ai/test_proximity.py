from core.routing.danger.proximity_checker import is_near_danger


result = is_near_danger(
    route_lat=12.6797,
    route_lng=108.0440,

    danger_lat=12.6800,
    danger_lng=108.0450,

    danger_type="accident",
)

print(result)