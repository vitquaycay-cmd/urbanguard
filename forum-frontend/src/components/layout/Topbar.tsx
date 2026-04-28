import { useEffect, useState } from 'react'
import { Bell, MessageSquare, Search } from 'lucide-react'
import LoginModal from '../auth/LoginModal'

type TopbarProps = {
  onCreatePost?: () => void
}

type User = {
  id?: string
  fullName?: string
  name?: string
  email?: string
  role?: string
}

export default function Topbar({ onCreatePost }: TopbarProps) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('forum_user')

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('forum_user')
        localStorage.removeItem('forum_token')
      }
    }
  }, [])

  const firstLetter =
    user?.fullName?.charAt(0).toUpperCase() ||
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'A'

  return (
    <>
      <div className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-bold text-gray-900">
            Diễn đàn Cộng đồng
          </h1>

          <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            <span>142 online</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-11 w-[350px] items-center gap-3 rounded-2xl border border-green-100 bg-white px-4 text-gray-400">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm sự cố, địa điểm, người dùng..."
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {user ? (
            <button
              type="button"
              title={user.fullName || user.name || user.email}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-sm font-bold text-white"
            >
              {firstLetter}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Đăng nhập
            </button>
          )}

          <button
            type="button"
            onClick={onCreatePost}
            className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-green-600"
          >
            + Tạo bài viết
          </button>
        </div>
      </div>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(userLogin) => {
          setUser(userLogin)
        }}
      />
    </>
  )
}