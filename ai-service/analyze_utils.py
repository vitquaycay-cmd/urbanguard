"""Từ dict predict → payload /ai/analyze — pure, dễ unit test."""

from __future__ import annotations

from typing import Any


def build_analyze_payload(pred: dict[str, Any]) -> dict[str, Any]:
    dets: list[dict[str, Any]] = pred.get("detections") or []
    confs = [float(d["confidence"]) for d in dets if "confidence" in d]
    max_conf = max(confs) if confs else 0.0
    labels = sorted({str(d["class_name"]) for d in dets if "class_name" in d})
    return {
        "detected": len(dets) > 0,
        "confidence": round(max_conf, 4),
        "labels": list(labels),
        "predict": pred,
    }
