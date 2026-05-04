import { useEffect, useState } from 'react'
import { FileText, Users, MessageCircle } from 'lucide-react'
import { api } from '../../services/api'

type ForumStatsData = {
  postsCount: number
  usersCount: number
  commentsCount: number
  onlineCount: number
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value)
}

export default function ForumStats() {
  const [stats, setStats] = useState<ForumStatsData>({
    postsCount: 0,
    usersCount: 0,
    commentsCount: 0,
    onlineCount: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<ForumStatsData>('/forum/post/stats')
        setStats(res.data)
      } catch (err) {
        console.error('Không tải được thống kê forum:', err)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="rounded-[28px] border border-[#e6efe8] bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[18px] font-bold text-gray-900">
              {formatNumber(stats.postsCount)}
            </div>
            <div className="text-sm text-gray-500">Bài viết</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#e6efe8] bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[18px] font-bold text-gray-900">
              {formatNumber(stats.usersCount)}
            </div>
            <div className="text-sm text-gray-500">Thành viên</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#e6efe8] bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[18px] font-bold text-gray-900">
              {formatNumber(stats.commentsCount)}
            </div>
            <div className="text-sm text-gray-500">Bình luận</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#e6efe8] bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div>
            <div className="text-[18px] font-bold text-green-500">
              {formatNumber(stats.onlineCount)}
            </div>
            <div className="text-sm text-gray-500">Đang online</div>
          </div>
        </div>
      </div>
    </div>
  )
}