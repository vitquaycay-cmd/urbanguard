type StatCardProps = {
  icon: string;
  value: string;
  label: string;
  meta: string;
  metaClass?: string;
  iconClass?: string;
};

function StatCard({
  icon,
  value,
  label,
  meta,
  metaClass = "",
  iconClass = "",
}: StatCardProps) {
  return (
    <div className="db-stat-card">
      <div className={`db-stat-card__icon ${iconClass}`}>{icon}</div>
      <div className="db-stat-card__value">{value}</div>
      <div className="db-stat-card__label">{label}</div>
      <div className={`db-stat-card__meta ${metaClass}`}>{meta}</div>
    </div>
  );
}

export default function DashboardStats() {
  return (
    <div className="db-stats">
      <StatCard
        icon="🕳️"
        value="142"
        label="Ổ gà"
        meta="↑ 12% tuần này"
        metaClass="db-stat-card__meta--green"
        iconClass="db-stat-card__icon--pink"
      />

      <StatCard
        icon="🚨"
        value="38"
        label="Tai nạn"
        meta="↓ 5% tuần này"
        metaClass="db-stat-card__meta--red"
        iconClass="db-stat-card__icon--orange"
      />

      <StatCard
        icon="🌊"
        value="21"
        label="Ngập lụt"
        meta="↑ 30% tháng này"
        metaClass="db-stat-card__meta--green"
        iconClass="db-stat-card__icon--blue"
      />

      <StatCard
        icon="✅"
        value="89%"
        label="Đã xử lý"
        meta="↑ 3% hôm qua"
        metaClass="db-stat-card__meta--green"
        iconClass="db-stat-card__icon--green"
      />
    </div>
  );
}