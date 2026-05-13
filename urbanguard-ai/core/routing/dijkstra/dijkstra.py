import heapq


def dijkstra(graph, start, end):
    """
    Tìm đường đi ngắn nhất bằng Dijkstra
    """

    # priority queue
    queue = [(0, start, [])]

    # node đã duyệt
    visited = set()

    while queue:

        # lấy node có cost nhỏ nhất
        cost, node, path = heapq.heappop(queue)

        # bỏ qua nếu đã duyệt
        if node in visited:
            continue

        visited.add(node)

        # cập nhật path
        path = path + [node]

        # nếu tới đích
        if node == end:
            return {
                "path": path,
                "cost": cost,
            }

        # duyệt neighbor
        for neighbor, neighbor_cost in graph[node].items():

            if neighbor not in visited:

                heapq.heappush(
                    queue,
                    (
                        cost + neighbor_cost,
                        neighbor,
                        path,
                    )
                )

    return None