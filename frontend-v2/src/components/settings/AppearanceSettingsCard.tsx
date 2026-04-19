import { useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import ToggleSwitch from "@/components/settings/ToggleSwitch";

function SelectRow({
  title,
  desc,
  value,
  onChange,
  options,
}: {
  title: string;
  desc: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-50 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="mt-0.5 text-xs text-gray-400">{desc}</div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[190px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-600 sm:w-auto sm:min-w-[190px]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AppearanceSettingsCard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("vi");
  const [fontSize, setFontSize] = useState("medium");
  const [animations, setAnimations] = useState(true);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
          <Palette className="h-4 w-4 text-purple-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Giao diện</h3>
      </div>

      <div>
        <div className="border-b border-gray-50 py-3">
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-900">
              Chủ đề màu sắc
            </div>
            <div className="mt-0.5 text-xs text-gray-400">
              Giao diện sáng hoặc tối
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors ${
                theme === "light"
                  ? "border-green-500 bg-green-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Sun className="h-6 w-6" />
              Sáng
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "border-green-500 bg-green-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Moon className="h-6 w-6" />
              Tối
            </button>
          </div>
        </div>

        <SelectRow
          title="Ngôn ngữ"
          desc="Ngôn ngữ hiển thị ứng dụng"
          value={language}
          onChange={setLanguage}
          options={[
            { value: "vi", label: "VN Tiếng Việt" },
            { value: "en", label: "English" },
          ]}
        />

        <SelectRow
          title="Cỡ chữ"
          desc="Điều chỉnh kích thước văn bản"
          value={fontSize}
          onChange={setFontSize}
          options={[
            { value: "small", label: "Nhỏ" },
            { value: "medium", label: "Vừa" },
            { value: "large", label: "Lớn" },
          ]}
        />

        <div className="flex items-center justify-between border-t border-gray-50 py-3">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Hiệu ứng động
            </div>
            <div className="mt-0.5 text-xs text-gray-400">
              Animation và transition trong app
            </div>
          </div>
          <ToggleSwitch checked={animations} onChange={setAnimations} />
        </div>
      </div>
    </section>
  );
}
