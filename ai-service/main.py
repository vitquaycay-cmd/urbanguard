"""
UrbanGuard — AI service (FastAPI + Ultralytics YOLOv8).

Chạy:
  cd ai-service
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Biến môi trường tùy chọn:
  UPLOADS_ROOT — đường dẫn tuyệt đối tới thư mục uploads của NestJS (mặc định: ../backend/uploads)
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from ultralytics import YOLO

from analyze_utils import build_analyze_payload
from path_utils import resolve_upload_candidate

# ---------------------------------------------------------------------------
# Model YOLO — cơ chế tải file .pt lần đầu
# ---------------------------------------------------------------------------
# Khi gọi YOLO('yolov8n.pt'):
# 1. Ultralytics kiểm tra xem file 'yolov8n.pt' đã có trong thư mục làm việc
#    hoặc trong thư mục cache (thường là ~/.cache/ultralytics/, tùy phiên bản)
#    hay chưa.
# 2. Nếu CHƯA có: thư viện tự động tải weights từ máy chủ của Ultralytics
#    (ví dụ GitHub Releases / CDN đi kèm gói ultralytics). Bạn sẽ thấy log
#    download trong console lần chạy đầu tiên (cần internet).
# 3. Nếu ĐÃ có: nạp trực tiếp từ đĩa — KHÔNG cần internet. Inference chạy hoàn
#    toàn offline sau khi file .pt đã nằm trên máy.
#
# Tóm lại: lần đầu cần mạng để tải weights; các lần sau và mọi lần predict
# chỉ đọc file local → chạy offline được (miễn là .pt vẫn còn trên ổ đĩa).
# ---------------------------------------------------------------------------

model = YOLO("yolov8n.pt")

# Nhãn COCO (YOLOv8n mặc định) liên quan ngữ cảnh giao thông đô thị.
# (COCO không có "traffic light" trong 80 lớp chuẩn; có thể mở rộng model custom sau.)
_TRAFFIC_COCO_NAMES = frozenset(
    {
        "person",
        "bicycle",
        "car",
        "motorcycle",
        "bus",
        "train",
        "truck",
        "boat",
    }
)


def _default_uploads_root() -> Path:
    env = os.environ.get("UPLOADS_ROOT")
    if env:
        return Path(env).resolve()
    # Cùng repo: ai-service/ -> ../backend/uploads
    return (Path(__file__).resolve().parent.parent / "backend" / "uploads").resolve()


UPLOADS_ROOT = _default_uploads_root()

app = FastAPI(
    title="UrbanGuard AI",
    description="YOLOv8n — phát hiện vật thể liên quan giao thông (COCO, lọc nhãn).",
    version="0.1.0",
)


class PredictRequest(BaseModel):
    """Đường dẫn ảnh trong thư mục uploads của NestJS (chỉ tên file hoặc relative an toàn)."""

    image_path: str = Field(
        ...,
        description="Ví dụ: '1730000000-uuid.jpg' hoặc relative trong uploads",
        examples=["1730000000-abc-123.jpg"],
    )


def predict(image_path: str | Path, uploads_root: Path | None = None) -> dict[str, Any]:
    """
    Chạy inference trên một ảnh nằm dưới thư mục uploads của NestJS.

    - Resolve đường dẫn tuyệt đối trong `uploads_root` (chống path traversal).
    - Chỉ giữ các detection thuộc nhóm giao thông (_TRAFFIC_COCO_NAMES).
    - Trả về dict JSON-serializable để NestJS `JSON.parse` / `axios` đọc được.
    """
    root = (uploads_root or UPLOADS_ROOT).resolve()
    candidate = resolve_upload_candidate(image_path, root)

    results = model.predict(source=str(candidate), verbose=False)
    detections: list[dict[str, Any]] = []

    if results:
        r0 = results[0]
        if r0.boxes is not None and len(r0.boxes):
            names = r0.names
            for box in r0.boxes:
                cls_id = int(box.cls[0])
                name = names.get(cls_id, str(cls_id))
                if name not in _TRAFFIC_COCO_NAMES:
                    continue
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].tolist()
                detections.append(
                    {
                        "class_id": cls_id,
                        "class_name": name,
                        "confidence": round(conf, 4),
                        "bbox_xyxy": [round(x, 2) for x in xyxy],
                    }
                )

    return {
        "ok": True,
        # Chỉ tên file trong uploads — không trả đường dẫn tuyệt đối (tránh lộ filesystem qua API/DB).
        "image_path": candidate.name,
        "image_filename": candidate.name,
        "model": "yolov8n",
        "traffic_filter": sorted(_TRAFFIC_COCO_NAMES),
        "detections": detections,
        "traffic_related_count": len(detections),
        "message": (
            f"Tìm thấy {len(detections)} vật thể (đã lọc nhóm giao thông)."
            if detections
            else "Không có vật thể giao thông nào trong tập nhãn đã chọn (hoặc ảnh không chứa các lớp đó)."
        ),
    }


ai_router = APIRouter(prefix="/ai", tags=["ai"])


@ai_router.post("/analyze")
def analyze_endpoint(body: PredictRequest) -> dict[str, Any]:
    """
    Phân tích cho NestJS AIService: `detected`, `confidence` (max trong các bbox giao thông),
    `labels` (unique class_name), kèm `predict` đầy đủ để lưu `aiSummary`.
    """
    try:
        pred = predict(body.image_path, UPLOADS_ROOT)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return build_analyze_payload(pred)


app.include_router(ai_router)


@app.get("/", include_in_schema=False)
def root() -> JSONResponse:
    """Tránh 404 khi mở http://127.0.0.1:8000/ trong trình duyệt."""
    return JSONResponse(
        {
            "service": "UrbanGuard AI",
            "version": app.version,
            "docs": "/docs",
            "openapi": "/openapi.json",
            "health": "/health",
            "endpoints": {"analyze": "POST /ai/analyze", "predict": "POST /predict"},
        }
    )


@app.get("/favicon.ico", include_in_schema=False)
def favicon() -> Response:
    """Trình duyệt tự gọi — trả 204 để không 404 trong log."""
    return Response(status_code=204)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "urban-guard-ai"}


@app.post("/predict")
def predict_endpoint(body: PredictRequest) -> dict[str, Any]:
    """
    Body JSON: { "image_path": "<tên file trong backend/uploads/>" }

    Response: JSON thuần (dict) — NestJS gọi HTTP rồi `response.data` là object.
    """
    try:
        return predict(body.image_path, UPLOADS_ROOT)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
