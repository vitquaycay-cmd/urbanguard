import { Settings } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 flex-shrink-0 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50"
        >
          Huỷ bỏ
        </button>
        <button
          type="button"
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
