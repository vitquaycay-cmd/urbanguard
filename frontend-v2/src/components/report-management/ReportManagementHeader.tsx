import { ClipboardList } from 'lucide-react'

type Props = {
  stats: {
    pending: number
    validated: number
    rejected: number
  }
}

export default function ReportManagementHeader({ stats }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 shrink-0 text-green-600" aria-hidden />
          <h2 className="text-2xl font-bold text-gray-900">
            Quản lý báo cáo
          </h2>
        </div>
        <div className="mt-2 flex gap-3">
          <div className="rounded-xl border border-yellow-100 bg-yellow-50 px-3 py-2 text-center">
            <div className="text-xl font-bold text-yellow-800">
              {stats.pending}
            </div>
            <div className="text-xs text-gray-400">Chờ duyệt</div>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-center">
            <div className="text-xl font-bold text-green-800">
              {stats.validated}
            </div>
            <div className="text-xs text-gray-400">Đã duyệt</div>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center">
            <div className="text-xl font-bold text-red-800">
              {stats.rejected}
            </div>
            <div className="text-xs text-gray-400">Từ chối</div>
          </div>
        </div>
      </div>
    </div>
  )
}
