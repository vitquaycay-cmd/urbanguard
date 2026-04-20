import { useEffect, useState } from "react";
import ReportForm from "@/components/report/ReportForm";
import ReportLocationMap from "@/components/report/ReportLocationMap";
import { Phone } from "lucide-react";

const DEFAULT_LAT = 10.762622;
const DEFAULT_LNG = 106.660172;

const quickTips = [
  "Chụp ảnh bao quát toàn cảnh hiện trường để chúng tôi đánh giá quy mô.",
  "Mô tả cụ thể hướng lưu thông (VD: Hướng từ Q7 sang Q1) để điều phối phân luồng.",
  "Duy trì an toàn bản thân trước khi thực hiện báo cáo sự cố.",
];

export default function ReportPage() {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }, []);

  const handlePositionChange = (nextLat: number, nextLng: number) => {
    setLat(nextLat);
    setLng(nextLng);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <ReportForm latitude={lat} longitude={lng} />
      </div>

      <div className="w-full shrink-0 space-y-4 lg:w-80">
        <ReportLocationMap
          latitude={lat}
          longitude={lng}
          onPositionChange={handlePositionChange}
        />

        <div className="rounded-2xl bg-green-600 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">
            Hướng dẫn nhanh
          </p>
          <ul className="mt-2 space-y-2">
            {quickTips.map((text) => (
              <li key={text} className="flex gap-2 text-sm text-white">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/90" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" strokeWidth={2} />
            <span className="text-sm font-bold text-gray-900">Tổng đài hỗ trợ 24/7</span>
          </div>
          <p className="mt-1 text-xl font-bold text-green-600">1900 6789</p>
        </div>
      </div>
    </div>
  );
}
