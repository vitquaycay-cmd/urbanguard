const filters = [
  { label: "Nổi bật", active: true },
  { label: "Mới nhất" },
  { label: "Nhiều bình luận" },
  { label: "Chờ trả lời" },
  { label: "Ổ gà" },
  { label: "Tai nạn" },
  { label: "Ngập lụt" },
  { label: "Thước Phim" },
];

export default function ForumFilters() {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.label}
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            filter.active
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
