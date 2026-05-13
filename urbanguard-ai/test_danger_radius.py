from core.routing.danger.danger_radius import get_danger_radius

print("accident:", get_danger_radius("accident"))
print("flood:", get_danger_radius("flood"))
print("unknown:", get_danger_radius("unknown"))