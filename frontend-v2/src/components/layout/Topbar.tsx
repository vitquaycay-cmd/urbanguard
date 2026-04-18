import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, RotateCw, Bell, User, LogOut } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import {
  logoutRequest,
  getStoredRefreshToken,
  removeStoredTokens,
} from '@/services/auth.api'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useCurrentUser()
  const initial = (user?.fullname || user?.email || 'U')[0].toUpperCase()

  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      const refreshToken = getStoredRefreshToken()
      if (refreshToken) await logoutRequest(refreshToken)
    } catch {
      /* ignore API errors; vẫn xóa token local */
    }
    removeStoredTokens()
    navigate('/login')
  }

  return (
    <div className="fixed top-0 left-60 right-0 h-15 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-40">
      {/* Left Side - Title */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2 ml-6">
        {/* Search Input */}
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Refresh Button */}
        <button
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Refresh"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Link>

        {/* User Avatar + dropdown */}
        <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white transition-colors hover:bg-green-700"
            aria-expanded={showMenu}
            aria-haspopup="true"
            aria-label="Menu tài khoản"
          >
            {initial}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 z-50 w-48 rounded-2xl border border-gray-100 bg-white py-2 shadow-lg">
              <div className="border-b border-gray-50 px-4 py-2">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user?.fullname || user?.email}
                </p>
                <p className="truncate text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigate('/profile')
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <User size={16} className="text-gray-400" />
                Hồ sơ cá nhân
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
