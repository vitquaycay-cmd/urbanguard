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

function iconWrapperClass(iconClass: string): string {
  if (iconClass.includes("--green")) return "bg-green-100";
  if (iconClass.includes("--orange")) return "bg-orange-100";
  if (iconClass.includes("--purple")) return "bg-violet-100";
  if (iconClass.includes("--blue")) return "bg-blue-100";
  if (iconClass.includes("--yellow")) return "bg-amber-100";
  if (iconClass.includes("--red")) return "bg-red-100";
  return "bg-gray-100";
}

function NotificationSection({
  title,
  items,
  isFirst,
}: {
  title: string;
  items: NotificationItem[];
  isFirst?: boolean;
}) {
  return (
    <section>
      <div
        className={`mb-3 text-xs font-bold uppercase tracking-widest text-gray-400 ${isFirst ? "mt-0" : "mt-6"}`}
      >
        {title}
      </div>

      <div>
        {items.map((item) => (
          <div
            key={item.id}
            className="mb-3 flex cursor-pointer items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${iconWrapperClass(item.iconClass)}`}
            >
              {item.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900">{item.title}</div>
              <div className="mt-0.5 text-xs text-gray-500">{item.desc}</div>
              <div className="mt-1 text-xs text-gray-400">{item.time}</div>
            </div>

            {item.unread ? (
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" aria-hidden />
            ) : null}
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
    <div>
      <NotificationSection title="Mới nhất" items={latest} isFirst />
      <NotificationSection title="Hôm nay" items={today} />
    </div>
  );
}
