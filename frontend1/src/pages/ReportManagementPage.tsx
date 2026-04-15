import AppShell from "../components/layout/AppShell";
import ReportManagementHeader from "../components/report-management/ReportManagementHeader";
import ReportManagementToolbar from "../components/report-management/ReportManagementToolbar";
import ReportManagementTable from "../components/report-management/ReportManagementTable";
import "../styles/report-management.css";

export default function ReportManagementPage() {
  return (
    <AppShell
      title="Quản lý báo cáo"
      subtitle="Quản lý, kiểm soát các báo cáo sự cố hệ thống"
    >
      <div className="rm-page">
        <ReportManagementHeader />
        <ReportManagementToolbar />
        <ReportManagementTable />
      </div>
    </AppShell>
  );
}