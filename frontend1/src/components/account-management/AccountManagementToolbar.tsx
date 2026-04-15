export default function AccountManagementToolbar() {
  return (
    <div className="am-toolbar">
      <div className="am-search-wrap">
        <span className="am-search-icon">⌕</span>
        <input
          type="text"
          className="am-search-input"
          placeholder="Tìm kiếm theo tên, email, ID..."
        />
      </div>

      <select className="am-filter-select">
        <option>Tất cả vai trò</option>
        <option>Người dân</option>
        <option>Ban quản lí</option>
        <option>Kiểm duyệt viên</option>
      </select>

      <select className="am-filter-select">
        <option>Tất cả trạng thái</option>
        <option>Hoạt động</option>
        <option>Bị khóa</option>
      </select>
    </div>
  );
}