"""Resolve đường dẫn ảnh trong thư mục uploads — tách riêng để test không cần YOLO."""

from __future__ import annotations

from pathlib import Path


def resolve_upload_candidate(image_path: str | Path, uploads_root: Path) -> Path:
    """
    Chỉ cho phép file nằm trong uploads_root (theo tên file hoặc path đã resolve trong root).
    Raises ValueError nếu path traversal / ngoài root.
    Raises FileNotFoundError nếu không phải file tồn tại.
    """
    root = uploads_root.resolve()
    raw = Path(image_path)
    candidate = (root / raw.name).resolve() if not raw.is_absolute() else raw.resolve()
    try:
        candidate.relative_to(root)
    except ValueError as e:
        raise ValueError(
            f"Đường dẫn không nằm trong uploads: {image_path}",
        ) from e

    if not candidate.is_file():
        raise FileNotFoundError(f"Không tìm thấy file: {candidate}")

    return candidate
