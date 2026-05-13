DANGER_RADIUS = {
    "accident": 50,      # tai nạn: né trong bán kính 50m
    "flood": 80,         # ngập nước: né trong bán kính 80m
    "fire": 120,         # cháy: né trong bán kính 120m
    "tree_fall": 40,     # cây đổ: né trong bán kính 40m
    "pothole": 20,       # ổ gà: né trong bán kính 20m
    "obstacle": 30,      # vật cản chung: né trong bán kính 30m
}


def get_danger_radius(danger_type: str) -> int:
    return DANGER_RADIUS.get(danger_type, 30)