type TopbarProps = {
  title: string;
  subtitle?: string;
};

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="app-topbar">
      <div>
        <h1 className="app-topbar__title">{title}</h1>
        {subtitle && <p className="app-topbar__subtitle">{subtitle}</p>}
      </div>

      <div className="app-topbar__actions">
        <span className="app-topbar__live">● Live</span>

        <input
          className="app-topbar__search"
          type="text"
          placeholder="Tìm kiếm sự cố..."
        />

        <button className="app-topbar__icon-btn" type="button">
          🔔
        </button>

        <button className="app-topbar__icon-btn" type="button">
          ↩
        </button>
      </div>
    </header>
  );
}