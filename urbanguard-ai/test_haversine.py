from core.routing.utils.haversine import haversine_distance


distance = haversine_distance(
    12.6797,
    108.0440,
    12.6800,
    108.0450
)

print(f"Khoảng cách: {distance:.2f} mét")