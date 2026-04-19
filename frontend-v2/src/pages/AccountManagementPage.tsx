import { useState, useEffect, useCallback } from "react";
import AccountManagementHeader from "@/components/account-management/AccountManagementHeader";
import AccountManagementToolbar from "@/components/account-management/AccountManagementToolbar";
import AccountManagementTable from "@/components/account-management/AccountManagementTable";
import {
  getUsersRequest,
  banUserRequest,
  type AdminUserRow,
} from "@/services/user.api";

const LIMIT = 10;

export default function AccountManagementPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const isBanned =
        statusFilter === "active"
          ? false
          : statusFilter === "banned"
            ? true
            : undefined;

      const data = await getUsersRequest({
        page,
        limit: LIMIT,
        role: roleFilter || undefined,
        search: debouncedSearch || undefined,
        ...(typeof isBanned === "boolean" ? { isBanned } : {}),
      });
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  async function handleBan(userId: number, currentBanned: boolean) {
    try {
      await banUserRequest(userId, !currentBanned);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="w-full">
      <AccountManagementHeader stats={stats} />
      <AccountManagementToolbar
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <AccountManagementTable
        users={users}
        loading={loading}
        handleBan={handleBan}
        page={page}
        setPage={setPage}
        total={total}
        totalPages={totalPages}
        limit={LIMIT}
      />
    </div>
  );
}
