export default function ForumPostCard() {
  return (
    <div className="rounded-[32px] border border-[#dfe9e2] bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-xl font-bold text-white">
            T
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-[17px] font-bold text-gray-900">Trần Minh Đức</h3>
              <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">
                MOD
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span>12 phút trước</span>
              <span>•</span>
              <span>📍 Nguyễn Huệ, Q.1, TP.HCM</span>
            </div>
          </div>
        </div>

        <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-500">
          🕳️ Ổ gà
        </div>
      </div>

      <h2 className="mb-3 text-[22px] font-bold leading-9 text-gray-900">
        ⚠️ Ổ gà lớn trên đường Nguyễn Huệ – Nguy hiểm cho người đi xe máy
      </h2>

      <p className="mb-5 text-[16px] leading-8 text-gray-500">
        Phát hiện ổ gà rộng khoảng 50cm, sâu 15cm ngay giữa làn xe máy đoạn đối diện
        Bitexco. Đã có 2 người bị ngã tối qua. Cần xử lý khẩn cấp trước giờ cao điểm.
      </p>

      <div className="mb-5 flex h-[420px] items-end justify-center rounded-[28px] bg-[#d9f4e4] pb-16 text-gray-400">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 rounded-full bg-gradient-to-b from-[#6942c0] to-[#20103b]" />
          <p className="text-[16px]">Ảnh sự cố · 3 ảnh đính kèm</p>
        </div>
      </div>
    </div>
  )
}