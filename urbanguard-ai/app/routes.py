import os
from fastapi import APIRouter, UploadFile, File
from services.analyze_service import analyze
from app.config import UPLOAD_DIR
from services.route_service import find_safe_route
from pydantic import BaseModel
from services.real_route_service import find_real_safe_route
from typing import List, Optional
router = APIRouter()


@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # tạo đường dẫn lưu file
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # lưu file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # gọi AI
    result = analyze(file_path)

    return result

class SafeRouteRequest(BaseModel):
    start: str
    end: str


@router.post("/safe-route")
async def safe_route(body: SafeRouteRequest):
    return find_safe_route(body.start, body.end)

class DangerPoint(BaseModel):
    lat: float
    lng: float
    type: str
    penalty: int


class RealSafeRouteRequest(BaseModel):
    startLat: float
    startLng: float
    endLat: float
    endLng: float
    dangers: List[DangerPoint] = []
    


@router.post("/real-safe-route")
async def real_safe_route(body: RealSafeRouteRequest):
    dangers = [danger.model_dump() for danger in body.dangers]

    return find_real_safe_route(
        start_lat=body.startLat,
        start_lng=body.startLng,
        end_lat=body.endLat,
        end_lng=body.endLng,
        dangers=dangers,
    )