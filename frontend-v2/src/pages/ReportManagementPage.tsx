import { useCallback, useEffect, useMemo, useState } from 'react'
import ReportManagementHeader from '@/components/report-management/ReportManagementHeader'
import ReportManagementToolbar, {
  type ReportSortByValue,
  type ReportSortOrderValue,
  type StatusFilterValue,
  type TypeFilterValue,
} from '@/components/report-management/ReportManagementToolbar'
import ReportManagementTable, {
  type IncidentKind,
  type ReportManagementRow,
} from '@/components/report-management/ReportManagementTable'
import {
  deleteReportRequest,
  fetchAdminReports,
  fetchPendingReportsQueue,
  resolveReportImageUrl,
  updateReportStatusRequest,
  type ReportDetail,
} from '@/services/report.api'

const PAGE_SIZE = 20

function normalizeAiLabels(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    const labels = raw.filter((x): x is string => typeof x === 'string')
    return labels.length ? labels : null
  }
  if (typeof raw === 'string') {
    const labels = raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
    return labels.length ? labels : null
  }
  return null
}

function inferTypeLabel(labels: string[] | null): string {
  if (!labels?.length) return 'Khác'
  const j = labels.join(' ').toLowerCase()
  if (/pothole|ổ|crack|hole/.test(j)) return 'Ổ gà'
  if (/accident|tai nạn|collision|crash/.test(j)) return 'Tai nạn'
  if (/flood|ngập|water|rain/.test(j)) return 'Ngập lụt'
  return 'Khác'
}

function mapApiReportToRow(r: ReportDetail): ReportManagementRow {
  const labels = normalizeAiLabels(r.aiLabels)
  return {
    id: r.id,
    title: r.title,
    type: inferTypeLabel(labels),
    user: {
      fullname: r.user?.fullname ?? null,
      username: r.user?.username ?? null,
      email: r.user?.email ?? null,
    },
    createdAt: r.createdAt,
    status: r.status,
    trustScore: r.trustScore,
    imageUrl: r.imageUrl,
  }
}

function getIncidentKind(report: ReportManagementRow): IncidentKind {
  const t = report.type
  if (t === 'Ổ gà') return 'pothole'
  if (t === 'Tai nạn') return 'accident'
  if (t === 'Ngập lụt') return 'flood'
  return 'other'
}

async function loadStatusTotals(signal: AbortSignal) {
  const [pendingRes, validatedRes, rejectedRes] = await Promise.all([
    fetchPendingReportsQueue({ page: 1, limit: 1, signal }),
    fetchAdminReports({
      page: 1,
      limit: 1,
      status: 'VALIDATED',
      signal,
    }),
    fetchAdminReports({
      page: 1,
      limit: 1,
      status: 'REJECTED',
      signal,
    }),
  ])
  return {
    pending: pendingRes.meta.total,
    validated: validatedRes.meta.total,
    rejected: rejectedRes.meta.total,
  }
}

export default function ReportManagementPage() {
  const [reports, setReports] = useState<ReportManagementRow[]>([])
  const [meta, setMeta] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })
  const [stats, setStats] = useState({
    pending: 0,
    validated: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterValue>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>('all')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<ReportSortByValue>('createdAt')
  const [sortOrder, setSortOrder] = useState<ReportSortOrderValue>('desc')

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, debouncedSearch, sortBy, sortOrder])

  const usePendingFifoQueue =
    statusFilter === 'PENDING' && debouncedSearch.length === 0

  const showServerSort = !usePendingFifoQueue

  const refreshStats = useCallback(async () => {
    try {
      const ac = new AbortController()
      const next = await loadStatusTotals(ac.signal)
      setStats(next)
    } catch {
      /* bỏ qua lỗi thống kê — bảng chính vẫn hiển thị */
    }
  }, [])

  const bumpReload = useCallback(() => {
    setReloadToken((x) => x + 1)
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        let res: Awaited<ReturnType<typeof fetchAdminReports>>
        if (usePendingFifoQueue) {
          res = await fetchPendingReportsQueue({
            page,
            limit: PAGE_SIZE,
            signal: ac.signal,
          })
        } else {
          res = await fetchAdminReports({
            page,
            limit: PAGE_SIZE,
            status:
              statusFilter === 'all' ? undefined : statusFilter,
            search: debouncedSearch || undefined,
            sortBy,
            sortOrder,
            signal: ac.signal,
          })
        }
        if (ac.signal.aborted) return
        setReports(res.data.map(mapApiReportToRow))
        setMeta({
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          totalPages: Math.max(1, res.meta.totalPages),
        })
      } catch (e) {
        if (ac.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Không tải được danh sách')
        setReports([])
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [
    page,
    statusFilter,
    debouncedSearch,
    sortBy,
    sortOrder,
    usePendingFifoQueue,
    reloadToken,
  ])

  useEffect(() => {
    void refreshStats()
  }, [refreshStats, reloadToken])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reports.filter((r) => {
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
      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}
      <ReportManagementToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        showServerSort={showServerSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
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