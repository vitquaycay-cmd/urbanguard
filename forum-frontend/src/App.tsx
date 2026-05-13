import { Routes, Route, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import ForumStats from './components/forum/ForumStats'
import ForumFilters from './components/forum/ForumFilters'
import ForumPostCard from './components/forum/ForumPostCard'
import RightSidebar from './components/forum/RightSidebar'
import CreatePostModal from './components/forum/CreatePostModal'
import { api } from './services/api'
import {
  addForumComment,
  deleteForumPost,
  getForumPosts,
  shareForumPost,
  toggleLikePost,
  type ForumPost,
} from './services/forum.api'

type ForumHomeProps = {
  openCreate: boolean
  onCloseCreate: () => void
}

type CurrentUser = {
  id?: string
  userId?: string
  fullName?: string
  fullname?: string
  email?: string
  role?: string
}

function getCurrentUser(): CurrentUser | null {
  const savedUser = localStorage.getItem('forum_user')

  if (!savedUser) return null

  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem('forum_user')
    return null
  }
}

function getCurrentUserId(user: CurrentUser | null) {
  if (!user) return ''
  return user.id || user.userId || ''
}

function ForumHome({ openCreate, onCloseCreate }: ForumHomeProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchPosts() {
    try {
      setLoading(true)
      setError('')
      const data = await getForumPosts()
      setPosts(data)
      setCurrentUser(getCurrentUser())
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách bài viết')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeletePost(postId: string) {
    try {
      await deleteForumPost(postId)
      setPosts((prev) => prev.filter((post) => post.id !== postId))
    } catch (err: any) {
      console.error(err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Xoá bài viết thất bại',
      )
    }
  }

  async function handleLikePost(postId: string) {
    try {
      const data = await toggleLikePost(postId)

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: data.liked,
                likesCount: data.likesCount,
              }
            : post,
        ),
      )
    } catch (err: any) {
      console.error(err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Bạn cần đăng nhập để thả tim',
      )
    }
  }

  async function handleCommentPost(postId: string, content: string) {
    try {
      const comment = await addForumComment(postId, content)

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), comment],
                commentsCount: (post.commentsCount || 0) + 1,
              }
            : post,
        ),
      )
    } catch (err: any) {
      console.error(err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Bạn cần đăng nhập để bình luận',
      )
    }
  }

  async function handleSharePost(postId: string) {
    try {
      const url = `${window.location.origin}/post/${postId}`

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }

      const data = await shareForumPost(postId)

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                sharesCount: data.sharesCount,
              }
            : post,
        ),
      )

      alert('Đã copy link bài viết')
    } catch (err: any) {
      console.error(err)
      alert('Chia sẻ thất bại')
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <>
      <div className="space-y-6">
        <ForumStats />
        <ForumFilters />

        <div className="grid grid-cols-[minmax(0,1fr)_330px] gap-6">
          <div className="space-y-6">
            {loading && (
              <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-8 text-gray-500">
                Đang tải bài viết...
              </div>
            )}

            {error && (
              <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-red-500">
                {error}
              </div>
            )}

            {!loading && !error && posts.length === 0 && (
              <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-8 text-gray-500">
                Chưa có bài viết nào
              </div>
            )}

            {!loading &&
              !error &&
              posts.map((post) => {
                const authorName =
                  post.author?.fullName ||
                  post.author?.fullname ||
                  post.author?.username ||
                  post.author?.email ||
                  post.user?.fullName ||
                  post.user?.fullname ||
                  post.user?.username ||
                  post.user?.email ||
                  'Người dùng'

                const authorId = post.author?.id || post.user?.id || post.userId

                return (
                  <ForumPostCard
                    key={post.id}
                    postId={post.id}
                    authorId={authorId}
                    currentUserId={getCurrentUserId(currentUser)}
                    currentUserRole={currentUser?.role}
                    authorName={authorName}
                    authorInitial={authorName[0].toUpperCase()}
                    roleLabel={post.author?.role || post.user?.role || 'USER'}
                    timeText={post.createdAt || 'Vừa xong'}
                    locationText={
                      [post.district, post.city].filter(Boolean).join(', ') ||
                      'Chưa có vị trí'
                    }
                    categoryText={post.category?.name || 'Sự cố'}
                    title={post.title}
                    content={post.content}
                    media={post.media || []}
                    likedByMe={post.likedByMe || false}
                    likesCount={post.likesCount || 0}
                    commentsCount={post.commentsCount || 0}
                    sharesCount={post.sharesCount || 0}
                    comments={post.comments || []}
                    onDelete={handleDeletePost}
                    onLike={handleLikePost}
                    onComment={handleCommentPost}
                    onShare={handleSharePost}
                  />
                )
              })}
          </div>

          <RightSidebar />
        </div>
      </div>

      <CreatePostModal
        open={openCreate}
        onClose={onCloseCreate}
        onCreated={fetchPosts}
      />
    </>
  )
}

function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchPostDetail() {
    if (!id) return

    try {
      setLoading(true)
      setError('')

      const res = await api.get<ForumPost>(`/forum/post/${id}`)

      setPost(res.data)
      setCurrentUser(getCurrentUser())
    } catch (err) {
      console.error(err)
      setError('Không tải được chi tiết bài viết')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeletePost(postId: string) {
    try {
      await deleteForumPost(postId)
      window.location.href = '/'
    } catch (err: any) {
      console.error(err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Xoá bài viết thất bại',
      )
    }
  }

  async function handleLikePost(postId: string) {
    try {
      const data = await toggleLikePost(postId)

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likedByMe: data.liked,
              likesCount: data.likesCount,
            }
          : prev,
      )
    } catch (err: any) {
      console.error(err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Bạn cần đăng nhập để thả tim',
      )
    }
  }

  async function handleCommentPost(postId: string, content: string) {
    try {
      const comment = await addForumComment(postId, content)

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), comment],
              commentsCount: (prev.commentsCount || 0) + 1,
            }
          : prev,
      )
    } catch (err: any) {
      console.error(err)
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Bạn cần đăng nhập để bình luận',
      )
    }
  }

  async function handleSharePost(postId: string) {
    try {
      const url = `${window.location.origin}/post/${postId}`

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }

      const data = await shareForumPost(postId)

      setPost((prev) =>
        prev
          ? {
              ...prev,
              sharesCount: data.sharesCount,
            }
          : prev,
      )

      alert('Đã copy link bài viết')
    } catch (err: any) {
      console.error(err)
      alert('Chia sẻ thất bại')
    }
  }

  useEffect(() => {
    fetchPostDetail()
  }, [id])

  if (loading) {
    return (
      <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-8 text-gray-500">
        Đang tải chi tiết bài viết...
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-red-500">
        {error || 'Không tìm thấy bài viết'}
      </div>
    )
  }

  const authorName =
    post.author?.fullName ||
    post.author?.fullname ||
    post.author?.username ||
    post.author?.email ||
    post.user?.fullName ||
    post.user?.fullname ||
    post.user?.username ||
    post.user?.email ||
    'Người dùng'

  const authorId = post.author?.id || post.user?.id || post.userId

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() => (window.location.href = '/')}
        className="mb-5 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
      >
        ← Quay lại
      </button>

      <ForumPostCard
        postId={post.id}
        authorId={authorId}
        currentUserId={getCurrentUserId(currentUser)}
        currentUserRole={currentUser?.role}
        authorName={authorName}
        authorInitial={authorName[0].toUpperCase()}
        roleLabel={post.author?.role || post.user?.role || 'USER'}
        timeText={post.createdAt || 'Vừa xong'}
        locationText={
          [post.district, post.city].filter(Boolean).join(', ') ||
          'Chưa có vị trí'
        }
        categoryText={post.category?.name || 'Sự cố'}
        title={post.title}
        content={post.content}
        media={post.media || []}
        likedByMe={post.likedByMe || false}
        likesCount={post.likesCount || 0}
        commentsCount={post.commentsCount || 0}
        sharesCount={post.sharesCount || 0}
        comments={post.comments || []}
        onDelete={handleDeletePost}
        onLike={handleLikePost}
        onComment={handleCommentPost}
        onShare={handleSharePost}
      />
    </div>
  )
}

export default function App() {
  const [openCreate, setOpenCreate] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f7f8f7]">
      <Sidebar />

      <div className="ml-60 min-h-screen w-full">
        <Topbar onCreatePost={() => setOpenCreate(true)} />

        <div className="p-6">
          <Routes>
            <Route
              path="/"
              element={
                <ForumHome
                  openCreate={openCreate}
                  onCloseCreate={() => setOpenCreate(false)}
                />
              }
            />

            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}