from core.routing.graph.graph_builder import build_graph
from core.routing.dijkstra.dijkstra import dijkstra


graph = build_graph()

result = dijkstra(
    graph,
    start="A",
    end="C",
)

print(result)