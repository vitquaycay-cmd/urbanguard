def parse_results(results):
    detections = []

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            label = r.names[cls]

            detections.append({
                "label": label,
                "confidence": conf
            })

    return detections