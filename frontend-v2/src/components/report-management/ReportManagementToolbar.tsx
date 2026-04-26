import { Search } from 'lucide-react'

export type StatusFilterValue = 'all' | 'PENDING' | 'VALIDATED' | 'RESOLVED' | 'REJECTED'
export type TypeFilterValue = 'all' | 'pothole' | 'accident' | 'flood'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: StatusFilterValue
  onStatusFilterChange: (v: StatusFilterValue) => void
  typeFilter: TypeFilterValue
  onTypeFilterChange: (v: TypeFilterValue) => void
}

const selectClass =
  'rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 bg-white'

export default function ReportManagementToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề, người gửi, ID..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>
      <select
        className={selectClass}
        value={statusFilter}
        onChange={(e) =>
          onStatusFilterChange(e.target.value as StatusFilterValue)
        }
        aria-label="Lọc theo trạng thái"
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="PENDING">Chờ duyệt</option>
        <option value="VALIDATED">Đang hiển thị</option>
        <option value="RESOLVED">Đã khắc phục</option>
        <option value="REJECTED">Từ chối</option>
      </select>
      <select
        className={selectClass}
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value as TypeFilterValue)}
        aria-label="Lọc theo loại"
      >
        <option value="all">Tất cả loại</option>
        <option value="pothole">Ổ gà</option>
        <option value="accident">Tai nạn</option>
        <option value="flood">Ngập lụt</option>
      </select>
    </div>
  )
}
