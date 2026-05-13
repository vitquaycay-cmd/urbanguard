from core.routing.graph.danger_graph_builder import build_danger_graph
from core.routing.dijkstra.dijkstra import dijkstra


graph = build_danger_graph()

result = dijkstra(
    graph,
    start="A",
    end="C",
)

print(result)