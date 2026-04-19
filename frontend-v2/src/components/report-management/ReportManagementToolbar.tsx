import { Search } from 'lucide-react'

export type StatusFilterValue = 'all' | 'PENDING' | 'VALIDATED' | 'REJECTED'
export type TypeFilterValue = 'all' | 'pothole' | 'accident' | 'flood'

export type ReportSortByValue = 'createdAt' | 'trustScore' | 'status'
export type ReportSortOrderValue = 'asc' | 'desc'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: StatusFilterValue
  onStatusFilterChange: (v: StatusFilterValue) => void
  typeFilter: TypeFilterValue
  onTypeFilterChange: (v: TypeFilterValue) => void
  /** Ẩn khi đang dùng hàng chờ PENDING (FIFO cố định). */
  showServerSort?: boolean
  sortBy?: ReportSortByValue
  sortOrder?: ReportSortOrderValue
  onSortByChange?: (v: ReportSortByValue) => void
  onSortOrderChange?: (v: ReportSortOrderValue) => void
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
  showServerSort = false,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortByChange,
  onSortOrderChange,
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
        <option value="VALIDATED">Đã duyệt</option>
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
      {showServerSort && onSortByChange && onSortOrderChange && (
        <>
          <select
            className={selectClass}
            value={sortBy}
            onChange={(e) =>
              onSortByChange(e.target.value as ReportSortByValue)
            }
            aria-label="Sắp xếp theo trường"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="trustScore">Trust score</option>
            <option value="status">Trạng thái</option>
          </select>
          <select
            className={selectClass}
            value={sortOrder}
            onChange={(e) =>
              onSortOrderChange(e.target.value as ReportSortOrderValue)
            }
            aria-label="Chiều sắp xếp"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </>
      )}
    </div>
  )
}
