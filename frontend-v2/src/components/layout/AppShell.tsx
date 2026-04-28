import { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onLogout?: () => void;
}

export default function AppShell({
  title,
  subtitle,
  children,
  onLogout,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onLogout={onLogout} />

      <Topbar title={title} subtitle={subtitle} />

      {/* Main Content */}
      <main
        className="ml-60 mt-15 flex-1 overflow-y-auto p-6"
        style={{ minHeight: "calc(100vh - 60px)" }}
      >
        {children}
      </main>
    </div>
  );
}
