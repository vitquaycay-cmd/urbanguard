import { useEffect, useState } from 'react'
import { Bell, MessageSquare, Search, X, Send, ArrowLeft } from 'lucide-react'
import LoginModal from '../auth/LoginModal'
import { api } from '../../services/api'

type TopbarProps = {
  onCreatePost?: () => void
}

type User = {
  id?: string
  userId?: string
  fullName?: string
  fullname?: string
  name?: string
  email?: string
  role?: string
}

type LoginSuccessPayload = {
  user: User
  token: string
}

type ForumStatsData = {
  postsCount: number
  usersCount: number
  commentsCount: number
  onlineCount: number
}

type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt?: string
}

type Conversation = {
  id: string
  user: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
  lastMessage: {
    id: string
    content: string
    senderId: string
    createdAt: string
  } | null
}

type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

function getCurrentUserId(user: User | null) {
  if (!user) return ''
  return user.id || user.userId || ''
}

export default function Topbar({ onCreatePost }: TopbarProps) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [chatOpen, setChatOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)

  const currentUserId = getCurrentUserId(user)

  function loadUserFromStorage() {
    const token = localStorage.getItem('forum_token')
    const savedUser = localStorage.getItem('forum_user')

    if (!token || !savedUser) {
      setUser(null)
      return
    }

    try {
      setUser(JSON.parse(savedUser))
    } catch {
      localStorage.removeItem('forum_token')
      localStorage.removeItem('forum_user')
      setUser(null)
    }
  }

  async function fetchOnlineCount() {
    try {
      const res = await api.get<ForumStatsData>('/forum/post/stats')
      setOnlineCount(res.data.onlineCount || 0)
    } catch (err) {
      console.error('Không tải được số online:', err)
    }
  }

  async function fetchNotifications() {
    const token = localStorage.getItem('forum_token')

    if (!token) {
      setLoginOpen(true)
      return
    }

    try {
      const res = await api.get<Notification[]>('/forum-notifications')
      setNotifications(res.data)
    } catch (err) {
      console.error('Lỗi load thông báo:', err)
    }
  }

  async function fetchUnreadCount() {
    const token = localStorage.getItem('forum_token')
    if (!token) return

    try {
      const res = await api.get<number | { count: number }>(
        '/forum-notifications/unread-count',
      )

      setUnreadCount(
        typeof res.data === 'number' ? res.data : res.data.count || 0,
      )
    } catch (err) {
      console.error('Lỗi count:', err)
    }
  }

  async function fetchConversations() {
    const token = localStorage.getItem('forum_token')

    if (!token) {
      setLoginOpen(true)
      return
    }

    try {
      setChatLoading(true)
      const res = await api.get<Conversation[]>('/forum/chat/conversations')
      setConversations(res.data)
    } catch (err) {
      console.error('Không tải được hộp thư:', err)
    } finally {
      setChatLoading(false)
    }
  }

  async function fetchMessages(conversationId: string) {
    try {
      setMessagesLoading(true)
      const res = await api.get<ChatMessage[]>(
        `/forum/chat/${conversationId}/messages`,
      )
      setMessages(res.data)
    } catch (err) {
      console.error('Không tải được tin nhắn:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    loadUserFromStorage()
    fetchOnlineCount()
    fetchUnreadCount()

    const interval = window.setInterval(() => {
      fetchOnlineCount()
      fetchUnreadCount()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!chatOpen || !selectedConversation) return

    const interval = window.setInterval(async () => {
      try {
        const res = await api.get<ChatMessage[]>(
          `/forum/chat/${selectedConversation.id}/messages`,
        )
        setMessages(res.data)
        fetchConversations()
      } catch (err) {
        console.error('Lỗi cập nhật tin nhắn:', err)
      }
    }, 2000)

    return () => window.clearInterval(interval)
  }, [chatOpen, selectedConversation])

  function handleOpenNotification() {
    if (!user) {
      setLoginOpen(true)
      return
    }

    setNotificationOpen((prev) => !prev)
    fetchNotifications()
    fetchUnreadCount()
  }

  function handleOpenChat() {
    if (!user) {
      setLoginOpen(true)
      return
    }

    setChatOpen(true)
    setSelectedConversation(null)
    fetchConversations()
  }

  async function openConversation(conversation: Conversation) {
    setSelectedConversation(conversation)
    await fetchMessages(conversation.id)
  }

  async function sendMessage() {
    if (!messageText.trim() || !selectedConversation) return

    try {
      const res = await api.post<ChatMessage>(
        `/forum/chat/${selectedConversation.id}/message`,
        {
          content: messageText.trim(),
        },
      )

      setMessages((prev) => [...prev, res.data])
      setMessageText('')
      fetchConversations()
    } catch (err) {
      console.error('Không gửi được tin nhắn:', err)
      alert('Không gửi được tin nhắn')
    }
  }

  const displayName =
    user?.fullName || user?.fullname || user?.name || user?.email || 'Người dùng'

  const firstLetter = displayName.charAt(0).toUpperCase()

  function handleLogout() {
    localStorage.removeItem('forum_token')
    localStorage.removeItem('forum_user')
    setUser(null)
    setUserMenuOpen(false)
    setChatOpen(false)
    setSelectedConversation(null)
    setNotificationOpen(false)
    setNotifications([])
    setUnreadCount(0)
    fetchOnlineCount()
  }

  function handleLoginSuccess(payload: LoginSuccessPayload) {
    localStorage.setItem('forum_token', payload.token)
    localStorage.setItem('forum_user', JSON.stringify(payload.user))
    setUser(payload.user)
    setLoginOpen(false)
    fetchOnlineCount()
    fetchUnreadCount()
  }

  function handleCreatePostClick() {
    setLoginOpen(false)
    onCreatePost?.()
  }

  return (
    <>
      <div className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-bold text-gray-900">
            Diễn đàn Cộng đồng
          </h1>

          <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            <span>{onlineCount} online</span>
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

          <div className="relative">
            <button
              type="button"
              onClick={handleOpenNotification}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-14 z-50 w-[350px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 p-4 font-bold text-gray-900">
                  Thông báo
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="py-8 text-center text-sm text-gray-400">
                      Chưa có thông báo nào
                    </p>
                  )}

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`border-b border-gray-100 p-3 text-sm ${
                        !n.isRead ? 'bg-green-50' : 'bg-white'
                      }`}
                    >
                      <p className="font-bold text-gray-900">{n.title}</p>
                      <p className="mt-1 leading-5 text-gray-600">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenChat}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <MessageSquare className="h-5 w-5" />
            {conversations.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-sm font-bold text-white"
              >
                {firstLetter}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {displayName}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    {user.role || 'user'}
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 w-full rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Đăng nhập
            </button>
          )}

          <button
            type="button"
            onClick={handleCreatePostClick}
            className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-600"
          >
            + Tạo bài viết
          </button>
        </div>
      </div>

      {chatOpen && (
        <div className="fixed right-6 top-24 z-50 flex h-[560px] w-[390px] flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl">
          {!selectedConversation ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Hộp thư</h3>
                  <p className="text-sm text-gray-500">Lịch sử đoạn chat</p>
                </div>

                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {chatLoading && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Đang tải hộp thư...
                  </p>
                )}

                {!chatLoading && conversations.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Chưa có đoạn chat nào
                  </p>
                )}

                {!chatLoading &&
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation)}
                      className="mb-3 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-green-50"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                        {conversation.user.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {conversation.user.fullName}
                        </p>

                        <p className="truncate text-sm text-gray-500">
                          {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedConversation(null)
                      setMessages([])
                      fetchConversations()
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                    {selectedConversation.user.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {selectedConversation.user.fullName}
                    </h3>
                    <p className="text-xs text-green-600">Đang trò chuyện</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setChatOpen(false)
                    setSelectedConversation(null)
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
                {messagesLoading && (
                  <p className="py-10 text-center text-sm text-gray-400">
                    Đang tải tin nhắn...
                  </p>
                )}

                {!messagesLoading && messages.length === 0 && (
                  <p className="py-10 text-center text-sm text-gray-400">
                    Chưa có tin nhắn nào
                  </p>
                )}

                {!messagesLoading &&
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                            isMe
                              ? 'bg-green-500 text-white'
                              : 'bg-white text-gray-800'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage()
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-400"
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500 text-white hover:bg-green-600"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}