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
    title: "⚠️ Ổ gà siêu to khổng lồ trên đường Đinh Tiên Hoàng đoạn qua cầu Bông",
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

export default function ForumPostList() {
  return (
    <div className="fm-post-list">
      {posts.map((post) => (
        <article
          key={post.id}
          className={`fm-post-card ${post.highlight ? "fm-post-card--highlight" : ""}`}
        >
          <div className="fm-post-card__top">
            <div className="fm-post__author">
              <div className={post.avatarClass}>{post.authorInitial}</div>

              <div className="fm-post__author-info">
                <div className="fm-post__author-row">
                  <span className="fm-post__author-name">{post.authorName}</span>
                  {post.badge && (
                    <span className="fm-post__badge">{post.badge}</span>
                  )}
                </div>
                <div className="fm-post__meta">{post.meta}</div>
              </div>
            </div>

            <span className={post.categoryClass}>{post.category}</span>
          </div>

          <h3 className="fm-post__title">{post.title}</h3>
          <p className="fm-post__content">{post.content}</p>

          <div className="fm-post__footer">
            <div className="fm-post__stats">
              <span>💗 {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>👁️ {post.views}</span>
            </div>

            <div className="fm-post__tags">
              {post.tags.map((tag) => (
                <span className="fm-post__tag" key={tag}>
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