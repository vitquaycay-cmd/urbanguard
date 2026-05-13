def build_graph():
    """
    Tạo graph demo
    """

    graph = {
        "A": {
            "B": 100,
            "D": 200,
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
            "A": 200,
            "C": 100,
        },
    }

    return graph