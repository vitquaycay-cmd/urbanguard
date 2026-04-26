import { useState } from "react";
import { Map } from "lucide-react";
import ToggleSwitch from "@/components/settings/ToggleSwitch";

export default function MapPrivacySettingsCard() {
  const [shareLocation, setShareLocation] = useState(true);
  const [radiusKm, setRadiusKm] = useState(5);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
          <Map className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Bản đồ & Vị trí</h3>
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-gray-50 py-3">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Chia sẻ vị trí
            </div>
            <div className="mt-0.5 text-xs text-gray-400">
              Cho phép ứng dụng dùng GPS của bạn
            </div>
          </div>
          <ToggleSwitch checked={shareLocation} onChange={setShareLocation} />
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-50 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Bán kính cảnh báo
            </div>
            <div className="mt-0.5 text-xs text-gray-400">
              Nhận cảnh báo trong phạm vi bao nhiêu km
            </div>
          </div>
          <div className="flex w-full min-w-[200px] flex-col items-stretch gap-2 sm:items-end">
            <input
              type="range"
              min={1}
              max={10}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="h-2 w-full max-w-[220px] cursor-pointer accent-green-600 sm:max-w-none"
            />
            <div className="text-right text-sm font-bold text-green-600">
              {radiusKm} km
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
