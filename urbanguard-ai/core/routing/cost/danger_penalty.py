DANGER_PENALTIES = {
    "low": 500,
    "medium": 2000,
    "high": 5000,
    "critical": 99999,
}


def get_danger_penalty(severity):
    return DANGER_PENALTIES.get(severity, 0)