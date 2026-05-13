from core.detection.model_loader import get_model

def detect(image_path: str):
    model = get_model()
    results = model(image_path)

    return results