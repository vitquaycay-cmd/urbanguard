from core.detection.yolo_detector import detect
from core.detection.detection_parser import parse_results
from core.incident.relevance_checker import check_relevance


def analyze(image_path: str):
    results = detect(image_path)
    detections = parse_results(results)

    relevance = check_relevance(detections)

    return {
        "detections": detections,
        **relevance
    }


