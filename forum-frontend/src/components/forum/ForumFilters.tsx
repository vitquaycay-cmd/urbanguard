export default function ForumFilters() {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-md">
        🔥 Nổi bật
      </button>

      <button className="rounded-full border border-[#dfe9e2] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
        🕒 Mới nhất
      </button>

      <button className="rounded-full border border-[#dfe9e2] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
        💬 Nhiều bình luận
      </button>

      <button className="rounded-full border border-[#dfe9e2] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
        ❓ Chờ trả lời
      </button>

      <button className="rounded-full border border-[#dfe9e2] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
        🕳️ Ổ gà
      </button>

      <button className="rounded-full border border-[#dfe9e2] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
        🚨 Tai nạn
      </button>

      <button className="rounded-full border border-[#dfe9e2] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
        🌊 Ngập lụt
      </button>
    </div>
  )
}