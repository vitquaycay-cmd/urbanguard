import { useEffect, useState } from 'react'
import { api } from '../../services/api'

type FeaturedPost = {
  id: string
  title: string
  likesCount: number
  commentsCount: number
  createdAt: string
}

type TopUser = {
  id: string
  fullName: string
  avatarUrl: string | null
  postsCount: number
}

function formatTime(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`
  return `${Math.floor(diff / 86400)} ngày`
}

export default function RightSidebar() {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, usersRes] = await Promise.all([
          api.get('/forum/post/featured'),
          api.get('/forum/post/top-users'),
        ])

        setFeaturedPosts(postsRes.data)
        setTopUsers(usersRes.data)
      } catch (err) {
        console.error('Lỗi load sidebar:', err)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-5">
      {/* ================= FEATURED POSTS ================= */}
      <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-6">
        <h3 className="mb-5 text-xl font-bold text-gray-900">
          🔥 Bài viết nổi bật
        </h3>

        <div className="space-y-5">
          {featuredPosts.map((post, index) => (
            <div
              key={post.id}
              className="border-b border-[#edf3ee] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex gap-4">
                <div className="min-w-[24px] text-[18px] font-bold text-green-500">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-[15px] font-semibold leading-7 text-gray-900">
                    {post.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span>💗 {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                    <span>🕒 {formatTime(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {featuredPosts.length === 0 && (
            <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      {/* ================= TOP USERS ================= */}
      <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-6">
        <h3 className="mb-5 text-xl font-bold text-gray-900">
          ⭐ Người dùng nổi bật
        </h3>

        <div className="space-y-5">
          {topUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between border-b border-[#edf3ee] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-gray-900">
                      {user.fullName}
                    </p>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                      TOP
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {user.postsCount} bài viết
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full border border-[#d6e8db] px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50"
              >
                Theo dõi
              </button>
            </div>
          ))}

          {topUsers.length === 0 && (
            <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  )
}