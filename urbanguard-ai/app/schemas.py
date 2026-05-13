from pydantic import BaseModel
from typing import List, Optional


class Detection(BaseModel):
    label: str
    confidence: float


class AnalyzeResponse(BaseModel):
    detections: List[Detection]