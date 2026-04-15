type AccountRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "blocked";
};

const accounts: AccountRow[] = [
  {
    id: "#0024",
    name: "Nguyễn Văn A",
    email: "nV.a.hoooor@gmail.com",
    role: "Người dân",
    status: "active",
  },
  {
    id: "#0025",
    name: "Nguyễn Thị B",
    email: "ran.ieleh@gmail.com",
    role: "Người dân",
    status: "active",
  },
  {
    id: "#0023",
    name: "Trần Minh C",
    email: "teamminh@gmail.com",
    role: "Người dân",
    status: "active",
  },
  {
    id: "#0028",
    name: "Hoàng D",
    email: "dlgrhoo@pgmail.com",
    role: "Người dân",
    status: "active",
  },
  {
    id: "#0021",
    name: "Lê C.",
    email: "leCmail1@gmail.com",
    role: "Người dân",
    status: "blocked",
  },
  {
    id: "#0019",
    name: "Nguyễn An",
    email: "nglaiaann@gmail.com",
    role: "Ban quản lí",
    status: "active",
  },
  {
    id: "#0018",
    name: "Nguyễn An",
    email: "bighhmvi@gmail.com",
    role: "Ban quản lí",
    status: "active",
  },
];

function getStatusText(status: AccountRow["status"]) {
  return status === "active" ? "Hoạt động" : "Bị khóa";
}

function getStatusClass(status: AccountRow["status"]) {
  return status === "active"
    ? "am-status am-status--active"
    : "am-status am-status--blocked";
}

export default function AccountManagementTable() {
  return (
    <div className="am-table-card">
      <div className="am-table">
        <div className="am-table__row am-table__row--head">
          <div>ID</div>
          <div>TÊN</div>
          <div>EMAIL</div>
          <div>VAI TRÒ</div>
          <div>TÌNH TRẠNG</div>
          <div>HÀNH ĐỘNG</div>
        </div>

        {accounts.map((account) => (
          <div className="am-table__row" key={account.id}>
            <div className="am-id">{account.id}</div>
            <div>{account.name}</div>
            <div className="am-email">{account.email}</div>
            <div>{account.role}</div>
            <div>
              <span className={getStatusClass(account.status)}>
                {getStatusText(account.status)}
              </span>
            </div>
            <div className="am-actions">
              <button className="am-btn am-btn--edit">✓ Chỉnh sửa</button>

              {account.status === "active" ? (
                <button className="am-btn am-btn--danger">
                  X Khóa tài khoản
                </button>
              ) : (
                <button className="am-btn am-btn--unlock">
                  &lt; Mở khóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}