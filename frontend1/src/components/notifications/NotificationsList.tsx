type NotificationItem = {
  id: number;
  section: "Mới nhất" | "Hôm nay";
  icon: string;
  iconClass: string;
  title: string;
  desc: string;
  time: string;
  unread?: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: 1,
    section: "Mới nhất",
    icon: "✅",
    iconClass: "nt-item__icon nt-item__icon--green",
    title: "Báo cáo #1842 của bạn đã được phê duyệt",
    desc: "Ổ gà tại Đinh Tiên Hoàng, Q.1 · +10 điểm uy tín",
    time: "2 phút trước",
    unread: true,
  },
  {
    id: 2,
    section: "Mới nhất",
    icon: "🚨",
    iconClass: "nt-item__icon nt-item__icon--orange",
    title: "Cảnh báo khẩn: Tai nạn nghiêm trọng cách bạn 500m",
    desc: "Ngã tư Cộng Hòa – Hoàng Văn Thụ, Tân Bình",
    time: "15 phút trước",
    unread: true,
  },
  {
    id: 3,
    section: "Mới nhất",
    icon: "🏆",
    iconClass: "nt-item__icon nt-item__icon--purple",
    title: "Chúc mừng! Bạn đạt huy hiệu Top Contributor 🎉",
    desc: "Đây là phần thưởng cho 100 báo cáo chính xác đầu tiên",
    time: "3 giờ trước",
    unread: true,
  },
  {
    id: 4,
    section: "Hôm nay",
    icon: "💬",
    iconClass: "nt-item__icon nt-item__icon--blue",
    title: "Trần Minh Tuấn đã bình luận vào bài viết của bạn",
    desc: "\"Cảm ơn bạn đã báo cáo, mình cũng đi qua đó thấy rất nguy hiểm...\"",
    time: "5 giờ trước",
  },
  {
    id: 5,
    section: "Hôm nay",
    icon: "⭐",
    iconClass: "nt-item__icon nt-item__icon--yellow",
    title: "Bài viết của bạn được 48 người thích",
    desc: "Ở gà siêu to khổng lồ trên Đinh Tiên Hoàng...",
    time: "6 giờ trước",
  },
  {
    id: 6,
    section: "Hôm nay",
    icon: "❌",
    iconClass: "nt-item__icon nt-item__icon--red",
    title: "Báo cáo #1755 bị từ chối",
    desc: "Lý do: Ảnh không rõ, không đủ bằng chứng xác thực",
    time: "7 giờ trước",
  },
];

function NotificationSection({
  title,
  items,
}: {
  title: string;
  items: NotificationItem[];
}) {
  return (
    <section className="nt-section">
      <div className="nt-section__title">{title}</div>

      <div className="nt-list">
        {items.map((item) => (
          <div className="nt-item" key={item.id}>
            <div className={item.iconClass}>{item.icon}</div>

            <div className="nt-item__content">
              <div className="nt-item__title">{item.title}</div>
              <div className="nt-item__desc">{item.desc}</div>
              <div className="nt-item__time">{item.time}</div>
            </div>

            {item.unread && <div className="nt-item__dot" />}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function NotificationsList() {
  const latest = notifications.filter((item) => item.section === "Mới nhất");
  const today = notifications.filter((item) => item.section === "Hôm nay");

  return (
    <div className="nt-card">
      <NotificationSection title="Mới nhất" items={latest} />
      <NotificationSection title="Hôm nay" items={today} />
    </div>
  );
}