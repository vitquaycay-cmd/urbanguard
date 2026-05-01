import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import ForumStats from './components/forum/ForumStats'
import ForumFilters from './components/forum/ForumFilters'
import ForumPostCard from './components/forum/ForumPostCard'
import RightSidebar from './components/forum/RightSidebar'
import CreatePostModal from './components/forum/CreatePostModal'
import { getForumPosts, type ForumPost } from './services/forum.api'

type ForumHomeProps = {
  openCreate: boolean
  onCloseCreate: () => void
}

function ForumHome({ openCreate, onCloseCreate }: ForumHomeProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchPosts() {
    try {
      setLoading(true)
      setError('')
      const data = await getForumPosts()
      setPosts(data)
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách bài viết')
    } finally {
      setLoading(false)
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
              posts.map((post) => (
                <ForumPostCard
                  key={post.id}
                  authorName={
                    post.user?.fullName ||
                    post.user?.fullname ||
                    post.user?.username ||
                    post.user?.email ||
                    'Người dùng'
                  }
                  authorInitial={
                    (
                      post.user?.fullName ||
                      post.user?.fullname ||
                      post.user?.username ||
                      post.user?.email ||
                      'U'
                    )[0].toUpperCase()
                  }
                  roleLabel="USER"
                  timeText={post.createdAt || 'Vừa xong'}
                  locationText={
                    [post.district, post.city].filter(Boolean).join(', ') ||
                    'Chưa có vị trí'
                  }
                  categoryText={post.category?.name || 'Sự cố'}
                  title={post.title}
                  content={post.content}
                />
              ))}
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
  return (
    <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Post Detail</h1>
      <p className="mt-3 text-gray-500">
        Trang chi tiết bài viết sẽ làm tiếp sau.
      </p>
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