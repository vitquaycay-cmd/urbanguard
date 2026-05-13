from core.routing.cost.danger_penalty import get_danger_penalty

print("low:", get_danger_penalty("low"))
print("medium:", get_danger_penalty("medium"))
print("high:", get_danger_penalty("high"))
print("critical:", get_danger_penalty("critical"))