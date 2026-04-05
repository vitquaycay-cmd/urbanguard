"""Payload /ai/analyze từ predict giả lập."""

from __future__ import annotations

from analyze_utils import build_analyze_payload


def test_empty_detections() -> None:
    out = build_analyze_payload({"detections": [], "ok": True})
    assert out["detected"] is False
    assert out["confidence"] == 0.0
    assert out["labels"] == []


def test_with_detections() -> None:
    pred = {
        "ok": True,
        "detections": [
            {"class_name": "car", "confidence": 0.81},
            {"class_name": "person", "confidence": 0.72},
        ],
    }
    out = build_analyze_payload(pred)
    assert out["detected"] is True
    assert out["confidence"] == 0.81
    assert out["labels"] == ["car", "person"]
