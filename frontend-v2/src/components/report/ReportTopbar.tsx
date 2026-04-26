export default function ReportTopbar() {
  return (
    <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-emerald-200/80 bg-emerald-50/90 px-5 py-4">
      <div>
        <h1 className="text-[28px] text-emerald-950">Gửi báo cáo</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Tạo báo cáo sự cố giao thông và hạ tầng đô thị
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="whitespace-nowrap text-sm font-bold text-green-600">● Live</div>
        <input
          type="text"
          className="h-10 w-[220px] max-w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 text-sm outline-none focus:border-green-500"
          placeholder="Tìm kiếm sự cố..."
        />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/80 bg-white text-lg"
        >
          🔔
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/80 bg-white text-lg"
        >
          ↩
        </button>
      </div>
    </header>
  );
}
