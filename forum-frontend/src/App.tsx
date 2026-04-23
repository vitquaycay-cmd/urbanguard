import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import ForumStats from './components/forum/ForumStats'
import ForumFilters from './components/forum/ForumFilters'
import ForumPostCard from './components/forum/ForumPostCard'
import RightSidebar from './components/forum/RightSidebar'

function ForumHome() {
  return (
    <div className="space-y-6">
      <ForumStats />
      <ForumFilters />

      <div className="grid grid-cols-[minmax(0,1fr)_330px] gap-6">
        <div>
          <ForumPostCard />
        </div>

        <div>
          <RightSidebar />
        </div>
      </div>
    </div>
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
  return (
    <div className="flex min-h-screen bg-[#f7f8f7]">
      <Sidebar />

      <div className="ml-60 min-h-screen w-full">
        <Topbar />

        <div className="p-6">
          <Routes>
            <Route path="/" element={<ForumHome />} />
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}