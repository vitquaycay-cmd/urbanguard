from ultralytics import YOLO
from app.config import MODEL_PATH

_model = None

def get_model():
    global _model

    if _model is None:
        print("🔄 Loading YOLO model...")
        _model = YOLO(MODEL_PATH)
        print("✅ Model loaded")

    return _model