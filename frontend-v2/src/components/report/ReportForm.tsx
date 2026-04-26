import { Camera, Send } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { createReportRequest } from "@/services/report.api";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/jpg,image/heic,image/heif";

type ReportFormState = {
  type: string;
  severity: string;
  description: string;
};

type ReportFormProps = {
  latitude: number;
  longitude: number;
};

function buildApiTitle(state: ReportFormState): string {
  const d = state.description.trim();
  const head = d.split(/\n/)[0]?.trim() ?? "";
  if (head.length > 0) return head.slice(0, 120);
  const typePart =
    state.type === "pothole"
      ? "Ổ gà"
      : state.type === "flooding"
        ? "Ngập nước"
        : state.type === "accident"
          ? "Tai nạn"
          : state.type === "construction"
            ? "Công trình"
            : state.type === "broken-light"
              ? "Đèn đường hỏng"
              : "Sự cố";
  return `${typePart} — báo cáo UrbanGuard`;
}

function buildApiDescription(state: ReportFormState): string {
  const lines: string[] = [];
  if (state.description.trim()) lines.push(state.description.trim());
  const meta: string[] = [];
  if (state.type) meta.push(`Loại: ${state.type}`);
  if (state.severity) meta.push(`Mức độ: ${state.severity}`);
  if (meta.length) lines.push(meta.join(" | "));
  return lines.join("\n\n") || "Báo cáo từ UrbanGuard";
}

export default function ReportForm({ latitude, longitude }: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormState>({
    type: "",
    severity: "",
    description: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const revokePreviews = useCallback((urls: string[]) => {
    urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const applyFiles = useCallback(
    (list: FileList | File[]) => {
      const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
      if (arr.length === 0) return;

      const next: File[] = [];
      for (const f of arr) {
        if (f.size > MAX_FILE_BYTES) {
          setError("Mỗi ảnh tối đa 10MB.");
          return;
        }
        next.push(f);
        if (next.length >= MAX_FILES) break;
      }

      setError(null);
      setFiles(next);
      setSelectedNames(next.map((f) => f.name).join(", "));
      setPreviews((prev) => {
        revokePreviews(prev);
        return next.map((f) => URL.createObjectURL(f));
      });
    },
    [revokePreviews],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) {
      setFiles([]);
      setSelectedNames("");
      setPreviews((prev) => {
        revokePreviews(prev);
        return [];
      });
      return;
    }
    applyFiles(list);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) applyFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("Vui lòng chọn ít nhất một ảnh (tối đa 3).");
      return;
    }
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả sự cố.");
      return;
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Tọa độ không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const title = buildApiTitle(formData);
      const description = buildApiDescription(formData);
      await createReportRequest({
        title,
        description,
        latitude,
        longitude,
        image: files[0],
      });
      setFormData({ type: "", severity: "", description: "" });
      setFiles([]);
      setSelectedNames("");
      setPreviews((prev) => {
        revokePreviews(prev);
        return [];
      });
      if (inputRef.current) inputRef.current.value = "";
      alert("Đã gửi báo cáo thành công.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi báo cáo thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
            Ảnh hiện trường
          </label>
          <div
            role="presentation"
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-colors hover:border-green-400"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Camera className="mx-auto mb-3 text-gray-400" size={32} strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-700">
              Kéo thả hoặc nhấp để tải ảnh lên
            </p>
            <p className="mt-1 text-xs text-gray-400">Tối đa 3 ảnh (JPG, PNG)</p>
            {selectedNames && (
              <p className="mt-3 break-all text-xs font-medium text-gray-600">{selectedNames}</p>
            )}
          </div>
          {previews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {previews.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="type"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500"
            >
              Loại sự cố
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Chọn loại sự cố</option>
              <option value="pothole">Ổ gà</option>
              <option value="flooding">Ngập nước</option>
              <option value="accident">Tai nạn</option>
              <option value="construction">Công trình</option>
              <option value="broken-light">Đèn đường hỏng</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="severity"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500"
            >
              Mức độ nghiêm trọng
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Chọn mức độ</option>
              <option value="low">Nhẹ</option>
              <option value="medium">Trung bình</option>
              <option value="high">Nghiêm trọng</option>
              <option value="critical">Khẩn cấp</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500"
          >
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Mô tả chi tiết về sự cố..."
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="min-h-[120px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-70"
        >
          <Send className="h-4 w-4" />
          {loading ? "Đang gửi…" : "Gửi báo cáo"}
        </button>
      </form>
    </div>
  );
}
