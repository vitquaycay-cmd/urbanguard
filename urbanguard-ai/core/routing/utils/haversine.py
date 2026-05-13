from math import radians, sin, cos, sqrt, atan2


EARTH_RADIUS_M = 6371000  # mét


def haversine_distance(lat1, lng1, lat2, lng2):
    """
    Tính khoảng cách giữa 2 tọa độ GPS (mét)
    """

    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlng / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return EARTH_RADIUS_M * c