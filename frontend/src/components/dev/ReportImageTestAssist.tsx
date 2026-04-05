"use client";

import { useCallback, useId, useState } from "react";

const ENABLED =
  process.env.NEXT_PUBLIC_DEV_REPORT_IMAGE_TOOLS === "true" ||
  process.env.NEXT_PUBLIC_DEV_REPORT_IMAGE_TOOLS === "1";

/** 1×1 PNG tối thiểu (hợp lệ) — dùng khi cần file cực nhỏ. */
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function b64ToFile(name: string, mime: string): File {
  const bin = atob(TINY_PNG_B64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Bật khi NEXT_PUBLIC_DEV_REPORT_IMAGE_TOOLS=true: tải ảnh PNG test,
 * xem trước file chọn từ máy, hướng dẫn copy ảnh cố định cho Swagger.
 */
export function ReportImageTestAssist() {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onFile = useCallback((f: File | null) => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!f || !f.type.startsWith("image/")) {
      setFileName(null);
      return;
    }
    setFileName(f.name);
    setPreview(URL.createObjectURL(f));
  }, []);

  const downloadTinyPng = useCallback(() => {
    const file = b64ToFile("urbanguard-tiny.png", "image/png");
    triggerDownload(file, file.name);
  }, []);

  const downloadCanvasPng = useCallback(() => {
    const w = 480;
    const h = 360;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const hue = Math.floor(Math.random() * 360);
    ctx.fillStyle = `hsl(${hue} 65% 42%)`;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 12; i++) {
      ctx.fillRect((i * 47) % w, (i * 61) % h, 80, 8);
    }
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText("UrbanGuard — ảnh test", 16, 36);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(new Date().toISOString().slice(0, 19), 16, 58);
    canvas.toBlob((blob) => {
      if (!blob) return;
      triggerDownload(blob, `urbanguard-test-${Date.now()}.png`);
    }, "image/png");
  }, []);

  if (!ENABLED) return null;

  return (
    <details className="rounded-lg border border-dashed border-violet-300 bg-violet-50/80 px-3 py-2 text-sm text-violet-950">
      <summary className="cursor-pointer font-medium text-violet-900">
        Công cụ dev — ảnh test upload
      </summary>
      <div className="mt-2 space-y-3 text-violet-900/90">
        <p className="text-xs leading-relaxed">
          <strong>Swagger:</strong> chạy trong thư mục{" "}
          <code className="rounded bg-white/80 px-1">backend</code> lệnh{" "}
          <code className="rounded bg-white/80 px-1">
            npm run fixture:report-image -- &quot;đường-dẫn-ảnh&quot;
          </code>{" "}
          rồi luôn đính kèm file{" "}
          <code className="rounded bg-white/80 px-1">
            test-fixtures/report-images/current.*
          </code>{" "}
          — đổi ảnh test chỉ cần chạy lại lệnh, không đổi chỗ trong Swagger.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadTinyPng}
            className="rounded-md border border-violet-400 bg-white px-2 py-1 text-xs font-medium hover:bg-violet-100"
          >
            Tải PNG 1×1 (tối thiểu)
          </button>
          <button
            type="button"
            onClick={downloadCanvasPng}
            className="rounded-md border border-violet-400 bg-white px-2 py-1 text-xs font-medium hover:bg-violet-100"
          >
            Tải PNG mẫu (màu + timestamp)
          </button>
        </div>
        <div>
          <label htmlFor={inputId} className="text-xs font-medium">
            Xem trước ảnh trên máy (trước khi upload qua API)
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="mt-1 block w-full text-xs"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          {fileName && (
            <p className="mt-1 text-xs text-violet-800">Đã chọn: {fileName}</p>
          )}
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Xem trước"
              className="mt-2 max-h-40 rounded border border-violet-200 object-contain"
            />
          )}
        </div>
      </div>
    </details>
  );
}
