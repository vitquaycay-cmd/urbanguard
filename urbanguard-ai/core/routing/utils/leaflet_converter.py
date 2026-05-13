def convert_to_leaflet_coords(coordinates):

    return [
        [lat, lng]
        for lng, lat in coordinates
    ]