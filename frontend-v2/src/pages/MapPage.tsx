import ActiveReportsMap from "@/components/ActiveReportsMap";
import "@/styles/map.css";

const recentUpdates = [
  { id: 1, text: "Báo cáo #204 được xác thực", time: "2 phút trước" },
  { id: 2, text: "Cảnh báo mới: ngập Q.7", time: "12 phút trước" },
  { id: 3, text: "Tuyến OSRM cập nhật waypoint", time: "28 phút trước" },
];

function MapRightPanel() {
  return (
    <aside className="flex w-[360px] shrink-0 flex-col gap-4">
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
            <div className="text-[28px] font-extrabold leading-none text-green-600">
              201
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">
              Validated
            </div>
          </div>
          <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
            <div className="text-[28px] font-extrabold leading-none text-red-500">
              142
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">Pothole</div>
          </div>
          <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
            <div className="text-[28px] font-extrabold leading-none text-orange-500">
              38
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">
              Accident
            </div>
          </div>
          <div className="flex min-h-[88px] flex-col justify-center rounded-[18px] border border-slate-200/80 bg-slate-50 px-3.5 py-3.5">
            <div className="text-[28px] font-extrabold leading-none text-blue-500">
              21
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">
              Flooding
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Legend
        </h2>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-red-500" />
          <span>Pothole / Road Damage</span>
        </div>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-orange-500" />
          <span>Traffic Accident</span>
        </div>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-blue-500" />
          <span>Flooding Area</span>
        </div>
        <div className="flex min-h-[38px] items-center gap-2.5 text-sm font-semibold text-slate-700">
          <span className="h-3 w-3 shrink-0 rounded-full bg-green-600" />
          <span>Validated Safe Status</span>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">
          Recent updates
        </h2>
        <ul className="space-y-3">
          {recentUpdates.map((u) => (
            <li
              key={u.id}
              className="border-b border-gray-50 pb-3 last:border-0 last:pb-0"
            >
              <p className="text-sm font-medium text-gray-900">{u.text}</p>
              <p className="mt-0.5 text-xs text-gray-400">{u.time}</p>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default function MapPage() {
  return (
    <div className="flex min-h-[560px] w-full flex-1 gap-4">
      <div className="min-h-0 min-w-0 flex-1">
        <ActiveReportsMap />
      </div>
      <MapRightPanel />
    </div>
  );
}
