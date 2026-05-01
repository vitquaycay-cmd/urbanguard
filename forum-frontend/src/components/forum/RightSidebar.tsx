import { useEffect, useState } from 'react'
import { X, Send } from 'lucide-react'
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
  isFollowing?: boolean
}

type Conversation = {
  id: string
}

type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

type CurrentUser = {
  id?: string
  userId?: string
  fullName?: string
  email?: string
}

function formatTime(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`
  return `${Math.floor(diff / 86400)} ngày`
}

function getCurrentUserId() {
  try {
    const savedUser = localStorage.getItem('forum_user')
    if (!savedUser) return ''

    const user: CurrentUser = JSON.parse(savedUser)
    return user.id || user.userId || ''
  } catch {
    return ''
  }
}

export default function RightSidebar() {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])

  const [chatOpen, setChatOpen] = useState(false)
  const [chatUser, setChatUser] = useState<TopUser | null>(null)
  const [conversationId, setConversationId] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [followLoadingId, setFollowLoadingId] = useState('')

  const currentUserId = getCurrentUserId()

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, usersRes] = await Promise.all([
          api.get('/forum/post/featured'),
          api.get('/forum/post/top-users'),
        ])

        setFeaturedPosts(postsRes.data || [])

        const users: TopUser[] = usersRes.data || []
        const token = localStorage.getItem('forum_token')

        if (!token) {
          setTopUsers(users)
          return
        }

        const usersWithFollow = await Promise.all(
          users.map(async (user) => {
            if (user.id === currentUserId) {
              return { ...user, isFollowing: false }
            }

            try {
              const res = await api.get(`/forum/follow/${user.id}`)
              return { ...user, isFollowing: !!res.data?.isFollowing }
            } catch {
              return { ...user, isFollowing: false }
            }
          }),
        )

        setTopUsers(usersWithFollow)
      } catch (err) {
        console.error('Lỗi load sidebar:', err)
      }
    }

    fetchData()
  }, [currentUserId])

  useEffect(() => {
    if (!chatOpen || !conversationId) return

    const interval = window.setInterval(async () => {
      try {
        const res = await api.get<ChatMessage[]>(
          `/forum/chat/${conversationId}/messages`,
        )

        setMessages(res.data || [])
      } catch (err) {
        console.error('Lỗi cập nhật tin nhắn:', err)
      }
    }, 2000)

    return () => window.clearInterval(interval)
  }, [chatOpen, conversationId])

  async function handleToggleFollow(user: TopUser) {
    const token = localStorage.getItem('forum_token')

    if (!token) {
      alert('Bạn cần đăng nhập để theo dõi')
      return
    }

    if (user.id === currentUserId) {
      alert('Không thể tự theo dõi chính mình')
      return
    }

    try {
      setFollowLoadingId(user.id)

      const res = await api.post(`/forum/follow/${user.id}`)
      const followed = !!res.data?.followed

      setTopUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, isFollowing: followed } : item,
        ),
      )
    } catch (err) {
      console.error('Lỗi follow:', err)
      alert('Không thể thực hiện theo dõi')
    } finally {
      setFollowLoadingId('')
    }
  }

  async function openChat(user: TopUser) {
    const token = localStorage.getItem('forum_token')

    if (!token) {
      alert('Bạn cần đăng nhập để nhắn tin')
      return
    }

    if (user.id === currentUserId) {
      alert('Không thể nhắn tin cho chính mình')
      return
    }

    try {
      setChatLoading(true)
      setChatUser(user)
      setChatOpen(true)
      setMessages([])
      setMessageText('')

      const convRes = await api.post<Conversation>(`/forum/chat/start/${user.id}`)
      setConversationId(convRes.data.id)

      const msgRes = await api.get<ChatMessage[]>(
        `/forum/chat/${convRes.data.id}/messages`,
      )

      setMessages(msgRes.data || [])
    } catch (err) {
      console.error('Lỗi mở chat:', err)
      alert('Không mở được cuộc trò chuyện')
      setChatOpen(false)
    } finally {
      setChatLoading(false)
    }
  }

  async function sendMessage() {
    if (!messageText.trim() || !conversationId) return

    try {
      const content = messageText.trim()
      setMessageText('')

      const res = await api.post<ChatMessage>(
        `/forum/chat/${conversationId}/message`,
        { content },
      )

      setMessages((prev) => [...prev, res.data])
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err)
      alert('Không gửi được tin nhắn')
    }
  }

  return (
    <>
      <div className="space-y-5">
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
                      <span>💗 {post.likesCount || 0}</span>
                      <span>💬 {post.commentsCount || 0}</span>
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

        <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-6">
          <h3 className="mb-5 text-xl font-bold text-gray-900">
            ⭐ Người dùng nổi bật
          </h3>

          <div className="space-y-5">
            {topUsers.map((user) => (
              <div
                key={user.id}
                className="border-b border-[#edf3ee] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[15px] font-semibold text-gray-900">
                        {user.fullName}
                      </p>
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                        TOP
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.postsCount || 0} bài viết
                    </p>
                  </div>
                </div>

                {user.id !== currentUserId && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={followLoadingId === user.id}
                      onClick={() => handleToggleFollow(user)}
                      className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        user.isFollowing
                          ? 'border-green-500 bg-green-50 text-green-600 hover:bg-green-100'
                          : 'border-[#d6e8db] text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {followLoadingId === user.id
                        ? 'Đang xử lý...'
                        : user.isFollowing
                          ? 'Đang theo dõi'
                          : 'Theo dõi'}
                    </button>

                    <button
                      type="button"
                      onClick={() => openChat(user)}
                      className="flex-1 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                    >
                      Nhắn tin
                    </button>
                  </div>
                )}
              </div>
            ))}

            {topUsers.length === 0 && (
              <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {chatOpen && chatUser && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              {chatUser.avatarUrl ? (
                <img
                  src={chatUser.avatarUrl}
                  alt={chatUser.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  {chatUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {chatUser.fullName}
                </h3>
                <p className="text-xs text-green-600">Đang trò chuyện</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {chatLoading && (
              <p className="py-10 text-center text-sm text-gray-400">
                Đang tải tin nhắn...
              </p>
            )}

            {!chatLoading && messages.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-400">
                Chưa có tin nhắn nào
              </p>
            )}

            {!chatLoading &&
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
        </div>
      )}
    </>
  )
}