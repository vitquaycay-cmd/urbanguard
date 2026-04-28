const featuredPosts = [
  {
    rank: 1,
    title: 'Ổ gà khổng lồ trên Nguyễn Huệ gây tai nạn liên hoàn',
    likes: 248,
    comments: 56,
    time: '12 phút',
  },
  {
    rank: 2,
    title: 'Ngập lụt nghiêm trọng Q.7 – Người dân kêu cứu',
    likes: 182,
    comments: 89,
    time: '45 phút',
  },
  {
    rank: 3,
    title: 'CSGT đề xuất giải pháp mới cho khu vực Tân Sơn Nhất',
    likes: 156,
    comments: 42,
    time: '2 giờ',
  },
  {
    rank: 4,
    title: 'Cập nhật: Metro tuyến 1 sắp hoàn thành giai đoạn 2',
    likes: 134,
    comments: 28,
    time: '5 giờ',
  },
  {
    rank: 5,
    title: 'Hướng dẫn tránh điểm ngập mùa mưa 2026',
    likes: 112,
    comments: 35,
    time: '8 giờ',
  },
]

const topUsers = [
  {
    name: 'Nguyễn Văn An',
    badge: 'TOP',
    score: '847 điểm · 127 báo cáo',
    initial: 'A',
    color: 'bg-green-500',
  },
  {
    name: 'Trần Minh Đức',
    badge: 'MOD',
    score: '1,245 điểm · 203 báo cáo',
    initial: 'T',
    color: 'bg-red-500',
  },
]

export default function RightSidebar() {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-6">
        <h3 className="mb-5 text-xl font-bold text-gray-900">🔥 Bài viết nổi bật</h3>

        <div className="space-y-5">
          {featuredPosts.map((post) => (
            <div
              key={post.rank}
              className="border-b border-[#edf3ee] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex gap-4">
                <div className="min-w-[24px] text-[18px] font-bold text-green-500">
                  {post.rank}
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-[15px] font-semibold leading-7 text-gray-900">
                    {post.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span>💗 {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>🕒 {post.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#dfe9e2] bg-white p-6">
        <h3 className="mb-5 text-xl font-bold text-gray-900">⭐ Người dùng nổi bật</h3>

        <div className="space-y-5">
          {topUsers.map((user) => (
            <div
              key={user.name}
              className="flex items-center justify-between border-b border-[#edf3ee] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${user.color}`}
                >
                  {user.initial}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-gray-900">{user.name}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                      {user.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{user.score}</p>
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
        </div>
      </div>
    </div>
  )
}