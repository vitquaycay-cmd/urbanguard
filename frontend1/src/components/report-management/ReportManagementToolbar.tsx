export default function ReportManagementToolbar() {
  return (
    <div className="rm-toolbar">
      <div className="rm-search-wrap">
        <span className="rm-search-icon">⌕</span>
        <input
          type="text"
          className="rm-search-input"
          placeholder="Tìm kiếm theo nội dung, người báo cáo, ID..."
        />
      </div>

      <select className="rm-filter-select">
        <option>Tất cả sự cố</option>
        <option>Đèn giao thông</option>
        <option>Đậu xe trái phép</option>
        <option>Ổ gà</option>
        <option>Ngập lụt</option>
      </select>

      <select className="rm-filter-select">
        <option>Tất cả trạng thái</option>
        <option>Đang hoạt động</option>
        <option>Tạm dừng</option>
      </select>
    </div>
  );
}