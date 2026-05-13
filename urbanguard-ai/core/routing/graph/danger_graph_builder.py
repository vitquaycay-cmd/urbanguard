from core.routing.cost.edge_cost import calculate_edge_cost


def build_danger_graph():

    dangers = [
        {
            "lat": 12.6800,
            "lng": 108.0450,
            "type": "accident",
            "severity": "high",
        }
    ]

    graph = {

        "A": {
            "B": calculate_edge_cost(
                12.6797,
                108.0440,

                12.6800,
                108.0450,

                dangers,
            )["totalCost"],

            "D": 300,
        },

        "B": {
            "A": 100,
            "C": 100,
        },

        "C": {
            "B": 100,
            "D": 100,
        },

        "D": {
            "A": 300,
            "C": 100,
        },
    }

    return graph