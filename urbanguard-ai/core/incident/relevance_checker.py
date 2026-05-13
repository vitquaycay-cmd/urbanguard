TRAFFIC_LABELS = {
    "car",
    "truck",
    "bus",
    "motorcycle",
    "motorbike",
    "bicycle",
    "person",
}

WEAK_TRAFFIC_LABELS = {
    "traffic light",
    "stop sign",
    "parking meter",
}

TRASH_LABELS = {
    "potted plant",
    "cell phone",
    "remote",
    "tv",
    "laptop",
    "chair",
    "couch",
    "bed",
    "dog",
    "cat",
}


def check_relevance(detections):
    labels = [d["label"] for d in detections]

    score = 0
    reasons = []
    traffic_count = 0

    for label in labels:
        if label in TRAFFIC_LABELS:
            score += 20
            traffic_count += 1
            reasons.append(f"Yếu tố giao thông: {label}")

        elif label in WEAK_TRAFFIC_LABELS:
            score += 10
            reasons.append(f"Có thể liên quan: {label}")

        elif label in TRASH_LABELS:
            score -= 10
            reasons.append(f"Ít liên quan: {label}")

    if traffic_count >= 3:
        score += 20
        reasons.append("Nhiều yếu tố giao thông")

    score = max(0, min(score, 100))

    return {
        "isRelevant": score >= 40,
        "relevanceScore": score,
        "relevanceReasons": reasons,
    }