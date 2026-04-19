const filters = [
  { label: "🔥 Nổi bật", active: true },
  { label: "🆕 Mới nhất" },
  { label: "💬 Nhiều bình luận" },
  { label: "❓ Chờ trả lời" },
  { label: "🕳️ Ổ gà" },
  { label: "🚨 Tai nạn" },
  { label: "🌊 Ngập lụt" },
  {label:  "Thước Phim "}
];

export default function ForumFilters() {
  return (
    <div className="fm-filters">
      {filters.map((filter) => (
        <button
          key={filter.label}
          className={`fm-filter ${filter.active ? "fm-filter--active" : ""}`}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}