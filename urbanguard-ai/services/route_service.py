from core.routing.graph.danger_graph_builder import build_danger_graph
from core.routing.dijkstra.dijkstra import dijkstra


def find_safe_route(start: str, end: str):
    graph = build_danger_graph()

    result = dijkstra(
        graph=graph,
        start=start,
        end=end,
    )

    return {
        "start": start,
        "end": end,
        "safeRoute": result["path"],
        "totalCost": result["cost"],
        "message": "Đã tìm tuyến đường an toàn bằng Dijkstra có trọng số nguy hiểm.",
    }