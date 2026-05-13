import os
from dotenv import load_dotenv

# load biến môi trường
load_dotenv()

# thư mục gốc project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ===== APP CONFIG =====
APP_NAME = os.getenv("APP_NAME", "UrbanGuard AI Service")
APP_HOST = os.getenv("APP_HOST", "127.0.0.1")
APP_PORT = int(os.getenv("APP_PORT", "5000"))

# ===== MODEL =====
MODEL_PATH = os.getenv(
    "MODEL_PATH",
    os.path.join(BASE_DIR, "models", "yolov8n.pt")
)

# ===== UPLOAD =====
UPLOAD_DIR = os.getenv(
    "UPLOAD_DIR",
    os.path.join(BASE_DIR, "uploads")
)

# ===== AI RULE =====
AI_CONFIDENCE_APPROVE = float(os.getenv("AI_CONFIDENCE_APPROVE", "0.75"))
AI_CONFIDENCE_REVIEW = float(os.getenv("AI_CONFIDENCE_REVIEW", "0.40"))