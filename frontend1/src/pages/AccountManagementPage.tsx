import AppShell from "../components/layout/AppShell";
import AccountManagementHeader from "../components/account-management/AccountManagementHeader";
import AccountManagementToolbar from "../components/account-management/AccountManagementToolbar";
import AccountManagementTable from "../components/account-management/AccountManagementTable";
import "../styles/account-management.css";

export default function AccountManagementPage() {
  return (
    <AppShell
      title="Quản lý tài khoản"
      subtitle="Quản lý, kiểm soát các tài khoản hệ thống"
    >
      <div className="am-page">
        <AccountManagementHeader />
        <AccountManagementToolbar />
        <AccountManagementTable />
      </div>
    </AppShell>
  );
}