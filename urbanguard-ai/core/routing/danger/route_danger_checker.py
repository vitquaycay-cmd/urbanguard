from core.routing.danger.proximity_checker import is_near_danger


def check_route_dangers(route_coordinates, dangers):

    total_penalty = 0
    triggered_dangers = set()

    danger_points = []

    for point in route_coordinates:

        lng, lat = point

        for index, danger in enumerate(dangers):

            check = is_near_danger(
                route_lat=lat,
                route_lng=lng,

                danger_lat=danger["lat"],
                danger_lng=danger["lng"],

                danger_type=danger["type"],
            )

            if check["isDanger"]:

                # chỉ cộng penalty 1 lần
                if index not in triggered_dangers:

                    triggered_dangers.add(index)

                    penalty = danger["penalty"]

                    total_penalty += penalty

                    danger_points.append({
                        "point": point,
                        "danger": danger,
                        "penalty": penalty,
                    })

    return {
        "totalPenalty": total_penalty,
        "dangerPoints": danger_points,
    }