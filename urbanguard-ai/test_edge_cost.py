from core.routing.cost.edge_cost import calculate_edge_cost


dangers = [
    {
        "lat": 12.6800,
        "lng": 108.0450,
        "type": "accident",
        "severity": "high",
    }
]


result = calculate_edge_cost(
    start_lat=12.6797,
    start_lng=108.0440,

    end_lat=12.6800,
    end_lng=108.0450,

    dangers=dangers,
)

print(result)