import { Link } from "react-router-dom";

export default function ReportSidebar() {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-emerald-200/80 bg-emerald-50/90 px-4 py-5">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-gradient-to-br from-green-500 to-green-600 text-lg text-white">
          🛡️
        </div>
        <div className="text-[28px] font-extrabold text-green-600">
          UrbanGuard
        </div>
      </div>

      <div className="mb-7">
        <div className="mb-2.5 text-xs font-bold uppercase text-slate-400">
          Chính
        </div>
        <div className="mb-1.5 cursor-pointer rounded-xl px-3.5 py-3 text-slate-600 transition-colors hover:bg-emerald-100/80">
          Dashboard
        </div>
        <Link
          to="/map"
          className="mb-1.5 block cursor-pointer rounded-xl px-3.5 py-3 text-slate-600 transition-colors hover:bg-emerald-100/80"
        >
          Bản đồ
        </Link>
      </div>

      <div className="mb-7">
        <div className="mb-2.5 text-xs font-bold uppercase text-slate-400">
          Báo cáo
        </div>
        <div className="mb-1.5 cursor-pointer rounded-xl bg-emerald-100 px-3.5 py-3 font-bold text-green-600">
          Gửi báo cáo
        </div>
        <div className="mb-1.5 cursor-pointer rounded-xl px-3.5 py-3 text-slate-600 transition-colors hover:bg-emerald-100/80">
          Quản lý báo cáo
        </div>
      </div>

      <div className="mb-7">
        <div className="mb-2.5 text-xs font-bold uppercase text-slate-400">
          Tài khoản
        </div>
        <div className="mb-1.5 cursor-pointer rounded-xl px-3.5 py-3 text-slate-600 transition-colors hover:bg-emerald-100/80">
          Hồ sơ
        </div>
        <div className="mb-1.5 cursor-pointer rounded-xl px-3.5 py-3 text-slate-600 transition-colors hover:bg-emerald-100/80">
          Cài đặt
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-emerald-200/80 pt-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 font-bold text-white">
          N
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">Nguyễn An</div>
          <div className="text-xs text-slate-500">Thành viên tích cực</div>
        </div>
      </div>
    </aside>
  );
}
