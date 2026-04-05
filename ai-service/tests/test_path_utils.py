"""Test resolve upload — không import main (không tải YOLO)."""

from __future__ import annotations

from pathlib import Path

import pytest

from path_utils import resolve_upload_candidate


def test_resolve_accepts_file_in_root(tmp_path: Path) -> None:
    f = tmp_path / "x.jpg"
    f.write_bytes(b"\xff\xd8\xff")
    got = resolve_upload_candidate("x.jpg", tmp_path)
    assert got == f.resolve()


def test_resolve_rejects_absolute_outside_root(tmp_path: Path) -> None:
    outside = tmp_path.parent / "other_upload_area"
    outside.mkdir(exist_ok=True)
    f = outside / "stolen.jpg"
    f.write_bytes(b"\xff\xd8\xff")
    with pytest.raises(ValueError, match="không nằm trong uploads"):
        resolve_upload_candidate(str(f.resolve()), tmp_path)


def test_resolve_missing_file(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        resolve_upload_candidate("khong_ton_tai.png", tmp_path)
