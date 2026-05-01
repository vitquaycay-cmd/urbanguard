import { useEffect, useState } from 'react'
import { X, Send } from 'lucide-react'
import { api } from '../../services/api'

type MediaItem = {
  id?: string
  url: string
  type: string
  fileName?: string
  mimeType?: string
  size?: number
}

type CommentItem = {
  id: string
  content: string
  createdAt?: string
  user?: {
    id: string
    fullName?: string
    email?: string
    role?: string
  }
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

type ForumPostCardProps = {
  postId: string
  authorId?: string
  currentUserId?: string
  currentUserRole?: string
  authorName: string
  authorInitial: string
  roleLabel?: string
  timeText?: string
  locationText?: string
  categoryText?: string
  title: string
  content: string
  media?: MediaItem[]

  likedByMe?: boolean
  likesCount?: number
  commentsCount?: number
  comments?: CommentItem[]

  onDelete?: (postId: string) => void
  onLike?: (postId: string) => void
  onComment?: (postId: string, content: string) => void
}

const API_URL = 'http://localhost:4000'

export default function ForumPostCard({
  postId,
  authorId,
  currentUserId,
  currentUserRole,
  authorName,
  authorInitial,
  roleLabel = 'user',
  timeText = '12 phút trước',
  locationText = 'Nguyễn Huệ, Q.1, TP.HCM',
  categoryText = 'Ổ gà',
  title,
  content,
  media = [],

  likedByMe = false,
  likesCount = 0,
  commentsCount = 0,
  comments = [],

  onDelete,
  onLike,
  onComment,
}: ForumPostCardProps) {
  const [commentOpen, setCommentOpen] = useState(false)
  const [commentText, setCommentText] = useState('')

  const [chatOpen, setChatOpen] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const canDelete =
    !!currentUserId &&
    (currentUserId === authorId || currentUserRole === 'admin')

  const canMessage = !!authorId && authorId !== currentUserId

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

  function handleDelete() {
    const ok = window.confirm('Bạn có chắc muốn xoá bài viết này không?')
    if (!ok) return
    onDelete?.(postId)
  }

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()

    if (!currentUserId) {
      alert('Bạn cần đăng nhập để bình luận')
      return
    }

    if (!commentText.trim()) return

    onComment?.(postId, commentText.trim())
    setCommentText('')
    setCommentOpen(true)
  }

  async function openChat() {
    const token = localStorage.getItem('forum_token')

    if (!token) {
      alert('Bạn cần đăng nhập để nhắn tin')
      return
    }

    if (!authorId) {
      alert('Không tìm thấy người đăng bài')
      return
    }

    if (authorId === currentUserId) {
      alert('Không thể nhắn tin cho chính mình')
      return
    }

    try {
      setChatLoading(true)
      setChatOpen(true)
      setMessages([])
      setMessageText('')

      const convRes = await api.post<Conversation>(
        `/forum/chat/start/${authorId}`,
      )

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
      <div className="rounded-[32px] border border-[#dfe9e2] bg-white p-7 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-xl font-bold text-white">
              {authorInitial}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[17px] font-bold text-gray-900">
                  {authorName}
                </h3>

                <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">
                  {roleLabel}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <span>{timeText}</span>
                <span>•</span>
                <span>📍 {locationText}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-500">
              🕳️ {categoryText}
            </div>

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
              >
                Xoá
              </button>
            )}
          </div>
        </div>

        <h2 className="mb-3 text-[22px] font-bold leading-9 text-gray-900">
          {title}
        </h2>

        <p className="mb-5 text-[16px] leading-8 text-gray-500">{content}</p>

        {media.length > 0 ? (
          <div className="mb-5 grid grid-cols-1 gap-4">
            {media.map((item, index) => {
              const src = item.url.startsWith('http')
                ? item.url
                : `${API_URL}${item.url}`

              const isVideo =
                item.type === 'video' || item.mimeType?.startsWith('video/')

              if (isVideo) {
                return (
                  <video
                    key={item.id || index}
                    src={src}
                    controls
                    className="max-h-[520px] w-full rounded-[28px] bg-black object-contain"
                  />
                )
              }

              return (
                <img
                  key={item.id || index}
                  src={src}
                  alt={item.fileName || 'Ảnh bài viết'}
                  className="max-h-[520px] w-full rounded-[28px] object-cover"
                />
              )
            })}
          </div>
        ) : (
          <div className="mb-5 flex h-[260px] items-center justify-center rounded-[28px] bg-[#d9f4e4] text-gray-400">
            <p className="text-[16px]">Chưa có ảnh/video đính kèm</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => onLike?.(postId)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              likedByMe
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {likedByMe ? '❤️ Đã thích' : '🤍 Thích'} · {likesCount}
          </button>

          <button
            type="button"
            onClick={() => setCommentOpen((prev) => !prev)}
            className="rounded-full bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            💬 Bình luận · {commentsCount}
          </button>

          {canMessage && (
            <button
              type="button"
              onClick={openChat}
              className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-100"
            >
              💬 Nhắn tin
            </button>
          )}
        </div>

        {commentOpen && (
          <div className="mt-5 rounded-[24px] bg-gray-50 p-4">
            <form onSubmit={handleSubmitComment} className="flex gap-3">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  currentUserId
                    ? 'Viết bình luận...'
                    : 'Đăng nhập để bình luận...'
                }
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
              />

              <button
                type="submit"
                className="rounded-2xl bg-green-500 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600"
              >
                Gửi
              </button>
            </form>

            {comments.length > 0 && (
              <div className="mt-4 space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-2xl bg-white px-4 py-3 text-sm"
                  >
                    <p className="font-semibold text-gray-900">
                      {comment.user?.fullName ||
                        comment.user?.email ||
                        'Người dùng'}
                    </p>
                    <p className="mt-1 text-gray-600">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                {authorInitial}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {authorName}
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