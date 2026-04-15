import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/layout.css";

type AppShellProps = {
  title: string;
  subtitle?: string;
  rightPanel?: ReactNode;
  children: ReactNode;
};

export default function AppShell({
  title,
  subtitle,
  rightPanel,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__main">
        <Topbar title={title} subtitle={subtitle} />

        <div
          className={`app-shell__content ${
            rightPanel ? "app-shell__content--has-right" : ""
          }`}
        >
          <div className="app-shell__center">{children}</div>

          {rightPanel && <aside className="app-shell__right">{rightPanel}</aside>}
        </div>
      </div>
    </div>
  );
}