import { CheckCircle, Trash2, XCircle } from 'lucide-react'

export type IncidentKind = 'pothole' | 'accident' | 'flood' | 'other'

export type ReportManagementRow = {
  id: number
  title: string
  type: string
  user: {
    fullname?: string | null
    username?: string | null
    email?: string | null
  }
  createdAt: string
  status: string
  trustScore?: number
  imageUrl?: string | null
}

type Props = {
  reports: ReportManagementRow[]
  processingId: number | null
  resolveImageUrl: (imageUrl: string | null) => string | undefined
  getIncidentKind: (report: ReportManagementRow) => IncidentKind
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onResolve: (id: number) => void
  onDelete: (id: number) => void
}

function typeBadge(kind: IncidentKind) {
  switch (kind) {
    case 'pothole':
      return (
        <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
          Ổ gà
        </span>
      )
    case 'accident':
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          Tai nạn
        </span>
      )
    case 'flood':
      return (
        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
          Ngập lụt
        </span>
      )
    default:
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
          Khác
        </span>
      )
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
          Chờ duyệt
        </span>
      )
    case 'VALIDATED':
      return (
        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          Đã duyệt
        </span>
      )
    case 'RESOLVED':
      return (
        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
          Đã khắc phục
        </span>
      )
    case 'REJECTED':
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          Từ chối
        </span>
      )
    default:
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
          {status}
        </span>
      )
  }
}

function senderName(user: ReportManagementRow['user']) {
  return user.fullname?.trim() || user.username?.trim() || user.email
}

export default function ReportManagementTable({
  reports,
  processingId,
  resolveImageUrl,
  getIncidentKind,
  onApprove,
  onReject,
  onResolve,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                ID
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Tiêu đề
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Loại
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Người gửi
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Ngày gửi
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const img = resolveImageUrl(report.imageUrl ?? null)
              const kind = getIncidentKind(report)
              const busy = processingId === report.id
              const pending = report.status === 'PENDING'
              const validated = report.status === 'VALIDATED'
              return (
                <tr
                  key={report.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-4 align-middle">
                    <span className="text-sm font-bold text-green-600">
                      #{report.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 shrink-0 rounded-lg bg-gray-100"
                          aria-hidden
                        />
                      )}
                      <span className="line-clamp-2 text-sm font-medium text-gray-900">
                        {report.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">{typeBadge(kind)}</td>
                  <td className="px-4 py-4 align-middle text-sm text-gray-700">
                    {senderName(report.user)}
                  </td>
                  <td className="px-4 py-4 align-middle text-sm text-gray-600">
                    {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {statusBadge(report.status)}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex flex-wrap gap-2">
                      {pending && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onApprove(report.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="size-3.5" aria-hidden />
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onReject(report.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle className="size-3.5" aria-hidden />
                            Từ chối
                          </button>
                        </>
                      )}
                      {validated && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onResolve(report.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <CheckCircle className="size-3.5" aria-hidden />
                          Đã khắc phục
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDelete(report.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                        aria-label="Xóa báo cáo"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {reports.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-gray-500">
          Không có báo cáo phù hợp bộ lọc.
        </p>
      )}
    </div>
  )
}