import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  FileText,
  MessageSquare,
  Bell,
  User,
  Settings,
  Shield,
} from 'lucide-react'

type NavItem = {
  icon: any
  label: string
  href: string
  external?: boolean
  badge?: {
    text: string
    color: 'green' | 'orange' | 'red'
  }
}

export default function Sidebar() {
  const { pathname } = useLocation()

  const initial = 'N'
  const displayName = 'Nguyễn Văn A'
  const roleLabel = 'Thành viên'

  const mainNavItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: 'http://localhost:3002/dashboard',
      external: true,
    },
    {
      icon: Map,
      label: 'Map',
      href: 'http://localhost:3002/map',
      external: true,
      badge: { text: 'LIVE', color: 'green' },
    },
    {
      icon: FileText,
      label: 'Reports',
      href: 'http://localhost:3002/report',
      external: true,
      badge: { text: '5', color: 'orange' },
    },
    {
      icon: MessageSquare,
      label: 'Forum',
      href: '/',
      badge: { text: '12', color: 'green' },
    },
    
    {
      icon: Bell,
      label: 'Notifications',
      href: 'http://localhost:3002/notifications',
      external: true,
      badge: { text: '3', color: 'red' },
    },
  ]

  const personalNavItems: NavItem[] = [
    {
      icon: User,
      label: 'Profile',
      href: 'http://localhost:3002/profile',
      external: true,
    },
    {
      icon: Settings,
      label: 'Settings',
      href: 'http://localhost:3002/settings',
      external: true,
    },
  ]

  const navClass = (isActive: boolean) =>
    `mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
      isActive
        ? 'bg-green-50 text-green-700 font-semibold border-l-2 border-green-600 rounded-l-none rounded-r-xl'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`

  const renderBadge = (
    badge?: { text: string; color: 'green' | 'orange' | 'red' }
  ) => {
    if (!badge) return null

    const badgeClass =
      badge.color === 'green'
        ? 'bg-green-100 text-green-700'
        : badge.color === 'orange'
          ? 'bg-orange-100 text-orange-600'
          : 'bg-red-100 text-red-600'

    return (
      <span className={`text-[10px] font-bold px-2 rounded-full ${badgeClass}`}>
        {badge.text}
      </span>
    )
  }

  const isItemActive = (item: NavItem) => {
    if (item.label === 'Forum') return pathname === '/'
    if (item.label === 'Video') return pathname === '/videos'
    return false
  }

  return (
    <div
      className="fixed left-0 top-0 h-screen w-60 flex flex-col bg-white border-r border-gray-200 shadow-lg"
      style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">UrbanGuard</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Traffic Safety Monitor
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="mb-6">
          <p className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
            Main
          </p>

          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isItemActive(item)

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {renderBadge(item.badge)}
                  </a>
                )
              }

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={navClass(isActive)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {renderBadge(item.badge)}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <p className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
            Personal
          </p>

          <nav className="space-y-1">
            {personalNavItems.map((item) => {
              const Icon = item.icon

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="mx-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-600">
            <span className="text-sm font-bold text-white">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-gray-400">{roleLabel}</p>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl p-1 text-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Đăng xuất"
        >
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}