import { Eye, Heart, MessageSquare } from "lucide-react";

type ForumPost = {
  id: number;
  authorInitial: string;
  authorName: string;
  badge?: string;
  meta: string;
  title: string;
  content: string;
  category: string;
  categoryClass: string;
  tags: string[];
  likes: string;
  comments: string;
  views: string;
  highlight?: boolean;
  avatarClass?: string;
};

const posts: ForumPost[] = [
  {
    id: 1,
    authorInitial: "T",
    authorName: "Trần Minh Tuấn",
    badge: "Mod",
    meta: "15 phút trước · Q.1, TP.HCM",
    title:
      "⚠️ Ổ gà siêu to khổng lồ trên đường Đinh Tiên Hoàng đoạn qua cầu Bông",
    content:
      "Hôm nay sáng đi làm qua đây thấy ổ gà rộng khoảng 60cm, sâu 20cm, nguy hiểm cho xe máy. Đã báo cáo lên hệ thống nhưng muốn cộng đồng biết để tránh...",
    category: "🕳️ Ổ gà",
    categoryClass: "fm-post__category fm-post__category--pink",
    tags: ["Nguy hiểm", "Cần xử lý ngay"],
    likes: "48 thích",
    comments: "23 bình luận",
    views: "312 lượt xem",
    highlight: true,
    avatarClass: "fm-post__avatar fm-post__avatar--blue",
  },
  {
    id: 2,
    authorInitial: "N",
    authorName: "Nguyễn Thị Lan",
    badge: "Top",
    meta: "1 giờ trước · Q.7, TP.HCM",
    title: "Tình trạng ngập lụt đường Nguyễn Văn Linh sau mưa lớn chiều nay",
    content:
      "Mưa lớn khoảng 30 phút đã gây ngập khoảng 40cm ở đoạn gần vòng xoay, xe máy không thể đi qua. Ô tô cũng bắt đầu chết máy. Mọi người nên đi đường khác...",
    category: "🌊 Ngập",
    categoryClass: "fm-post__category fm-post__category--blue",
    tags: ["Khẩn cấp", "Tránh đường"],
    likes: "127 thích",
    comments: "67 bình luận",
    views: "1.2k lượt xem",
    avatarClass: "fm-post__avatar fm-post__avatar--green",
  },
  {
    id: 3,
    authorInitial: "P",
    authorName: "Phạm Đức Hùng",
    meta: "3 giờ trước · Tân Bình",
    title: "Tai nạn liên hoàn 3 xe tại ngã tư Cộng Hòa – Hoàng Văn Thụ",
    content:
      "Vừa chứng kiến vụ tai nạn 3 xe máy va chạm nhau, có người bị thương. Cảnh sát và xe cứu thương đang tới. Khu vực đang ùn tắc nặng...",
    category: "🚨 Tai nạn",
    categoryClass: "fm-post__category fm-post__category--orange",
    tags: ["Cảnh báo", "Ùn tắc"],
    likes: "86 thích",
    comments: "41 bình luận",
    views: "890 lượt xem",
    avatarClass: "fm-post__avatar fm-post__avatar--orange",
  },
];

function avatarRingClass(avatarClass?: string): string {
  if (avatarClass?.includes("--blue")) {
    return "bg-gradient-to-br from-blue-500 to-blue-600";
  }
  if (avatarClass?.includes("--green")) {
    return "bg-gradient-to-br from-green-500 to-green-600";
  }
  if (avatarClass?.includes("--orange")) {
    return "bg-gradient-to-br from-orange-500 to-orange-600";
  }
  return "bg-green-600";
}

function categoryBadgeClass(categoryClass: string): string {
  if (categoryClass.includes("--pink")) {
    return "bg-orange-100 text-orange-700";
  }
  if (categoryClass.includes("--blue")) {
    return "bg-blue-100 text-blue-700";
  }
  if (categoryClass.includes("--orange")) {
    return "bg-orange-100 text-orange-700";
  }
  return "bg-gray-100 text-gray-700";
}

function tagBadgeClass(tag: string): string {
  if (tag === "Nguy hiểm" || tag === "Khẩn cấp") {
    return "bg-red-100 text-red-600";
  }
  if (tag === "Cần xử lý ngay") {
    return "bg-orange-100 text-orange-600";
  }
  if (tag === "Tránh đường" || tag === "Cảnh báo") {
    return "bg-orange-100 text-orange-600";
  }
  if (tag === "Ùn tắc") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-green-100 text-green-700";
}

export default function ForumPostList() {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
            post.highlight ? "ring-1 ring-green-500/20" : ""
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarRingClass(post.avatarClass)}`}
              >
                {post.authorInitial}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-gray-900">
                    {post.authorName}
                  </span>
                  {post.badge && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                      {post.badge}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-sm text-gray-500">{post.meta}</div>
              </div>
            </div>

            <span
              className={`inline-flex flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${categoryBadgeClass(post.categoryClass)}`}
            >
              {post.category}
            </span>
          </div>

          <h3
            className={`mt-3 text-base font-bold leading-snug ${
              post.highlight ? "text-red-600" : "text-gray-900"
            }`}
          >
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {post.content}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                {post.likes}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {post.comments}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {post.views}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${tagBadgeClass(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
