import { useMemo, useState } from 'react'
import ReportManagementHeader from '@/components/report-management/ReportManagementHeader'
import ReportManagementToolbar, {
  type StatusFilterValue,
  type TypeFilterValue,
} from '@/components/report-management/ReportManagementToolbar'
import ReportManagementTable, {
  type IncidentKind,
  type ReportManagementRow,
} from '@/components/report-management/ReportManagementTable'

function getIncidentKind(report: ReportManagementRow): IncidentKind {
  const t = report.type
  if (t === 'Ổ gà') return 'pothole'
  if (t === 'Tai nạn') return 'accident'
  if (t === 'Ngập lụt') return 'flood'
  return 'other'
}

function resolveReportImageUrl(_imageUrl: string | null): string | undefined {
  return undefined
}

export default function ReportManagementPage() {
  const [reports, setReports] = useState<ReportManagementRow[]>([
    {
      id: 1842,
      title: 'Ổ gà lớn tại Đinh Tiên Hoàng',
      type: 'Ổ gà',
      user: { fullname: 'Nguyễn Văn A' },
      createdAt: '2026-03-22',
      status: 'PENDING',
      trustScore: 0.85,
    },
    {
      id: 1801,
      title: 'Va chạm tại Lê Văn Sỹ Q.3',
      type: 'Tai nạn',
      user: { fullname: 'Trần Thị B' },
      createdAt: '2026-03-18',
      status: 'PENDING',
      trustScore: 0.72,
    },
    {
      id: 1788,
      title: 'Ngập lụt Nguyễn Văn Linh Q.7',
      type: 'Ngập lụt',
      user: { fullname: 'Lê Văn C' },
      createdAt: '2026-03-15',
      status: 'VALIDATED',
      trustScore: 0.91,
    },
    {
      id: 1755,
      title: 'Kẹt xe Trường Chinh Tân Bình',
      type: 'Kẹt xe',
      user: { fullname: 'Phạm Thị D' },
      createdAt: '2026-03-10',
      status: 'REJECTED',
      trustScore: 0.45,
    },
  ])

  const stats = useMemo(() => {
    return {
      pending: reports.filter((r) => r.status === 'PENDING').length,
      validated: reports.filter((r) => r.status === 'VALIDATED').length,
      rejected: reports.filter((r) => r.status === 'REJECTED').length,
    }
  }, [reports])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterValue>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>('all')

  function handleApprove(id: number) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'VALIDATED' } : r)),
    )
  }

  function handleReject(id: number) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)),
    )
  }

  function handleDelete(id: number) {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      const kind = getIncidentKind(r)
      if (typeFilter !== 'all' && kind !== typeFilter) return false
      if (!q) return true
      const idMatch = String(r.id).includes(q.replace(/^#/, ''))
      const title = r.title.toLowerCase()
      const sender = `${r.user.fullname ?? ''} ${r.user.username ?? ''} ${r.user.email ?? ''}`.toLowerCase()
      return idMatch || title.includes(q) || sender.includes(q)
    })
  }, [reports, search, statusFilter, typeFilter])

  return (
    <div>
      <ReportManagementHeader stats={stats} />
      <ReportManagementToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      <ReportManagementTable
        reports={filtered}
        processingId={null}
        resolveImageUrl={resolveReportImageUrl}
        getIncidentKind={getIncidentKind}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    </div>
  )
}
