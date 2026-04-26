import { useEffect, useMemo, useState, useCallback } from 'react'
import ReportManagementHeader from '@/components/report-management/ReportManagementHeader'
import ReportManagementToolbar, {
  type StatusFilterValue,
  type TypeFilterValue,
} from '@/components/report-management/ReportManagementToolbar'
import ReportManagementTable, {
  type IncidentKind,
  type ReportManagementRow,
} from '@/components/report-management/ReportManagementTable'
import { fetchAdminReports, updateReportStatus, deleteReport } from '@/services/admin.api'
import { resolveReportImageUrl } from '@/lib/mapActiveReports'

function getIncidentKind(report: ReportManagementRow): IncidentKind {
  const t = report.type?.toLowerCase() || ''
  if (t === 'ổ gà' || t === 'pothole') return 'pothole'
  if (t === 'tai nạn' || t === 'accident') return 'accident'
  if (t === 'ngập lụt' || t === 'flood') return 'flood'
  return 'other'
}

export default function ReportManagementPage() {
  const [reports, setReports] = useState<ReportManagementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>('all')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchAdminReports({
        status: statusFilter,
        search: search
      })
      // Map API response to UI row format
      const mapped = (res.data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.aiLabels?.[0] || 'Khác',
        user: { fullname: r.user?.fullname, username: r.user?.username, email: r.user?.email },
        createdAt: r.createdAt,
        status: r.status,
        trustScore: r.trustScore,
        imageUrl: r.imageUrl
      }))
      setReports(mapped)
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => {
    return {
      pending: reports.filter((r) => r.status === 'PENDING').length,
      validated: reports.filter((r) => r.status === 'VALIDATED').length,
      resolved: reports.filter((r) => r.status === 'RESOLVED').length,
      rejected: reports.filter((r) => r.status === 'REJECTED').length,
    }
  }, [reports])

  async function handleApprove(id: number) {
    setProcessingId(id)
    try {
      await updateReportStatus(id, 'VALIDATED')
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Duyệt thất bại')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id: number) {
    setProcessingId(id)
    try {
      await updateReportStatus(id, 'REJECTED')
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Từ chối thất bại')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleResolve(id: number) {
    setProcessingId(id)
    try {
      await updateReportStatus(id, 'RESOLVED')
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(`Bạn có chắc muốn xóa báo cáo #${id}?`)) return
    setProcessingId(id)
    try {
      await deleteReport(id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại')
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const kind = getIncidentKind(r)
      if (typeFilter !== 'all' && kind !== typeFilter) return false
      return true
    })
  }, [reports, typeFilter])

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
      {loading && reports.length === 0 ? (
        <div className="py-20 text-center text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <ReportManagementTable
          reports={filtered}
          processingId={processingId}
          resolveImageUrl={resolveReportImageUrl}
          getIncidentKind={getIncidentKind}
          onApprove={handleApprove}
          onReject={handleReject}
          onResolve={handleResolve}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
