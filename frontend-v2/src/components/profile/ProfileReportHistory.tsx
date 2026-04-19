import { Filter } from "lucide-react";

type HistoryRow = {
  id: string;
  type: "pothole" | "accident" | "flood";
  address: string;
  date: string;
  status: "approved" | "pending" | "rejected";
};

const reportHistory: HistoryRow[] = [
  {
    id: "#1842",
    type: "pothole",
    address: "Đinh Tiên Hoàng, Q.1",
    date: "22/03/2026",
    status: "approved",
  },
  {
    id: "#1801",
    type: "accident",
    address: "Lê Văn Sỹ, Q.3",
    date: "18/03/2026",
    status: "approved",
  },
  {
    id: "#1788",
    type: "flood",
    address: "Nguyễn Văn Linh, Q.7",
    date: "15/03/2026",
    status: "pending",
  },
  {
    id: "#1755",
    type: "pothole",
    address: "Trường Chinh, Tân Bình",
    date: "10/03/2026",
    status: "rejected",
  },
  {
    id: "#1720",
    type: "accident",
    address: "Cộng Hòa, Tân Bình",
    date: "05/03/2026",
    status: "approved",
  },
];

function getTypeLabel(type: HistoryRow["type"]) {
  switch (type) {
    case "pothole":
      return "Ổ gà";
    case "accident":
      return "Tai nạn";
    case "flood":
      return "Ngập";
    default:
      return "";
  }
}

function getTypeBadgeClass(type: HistoryRow["type"]) {
  switch (type) {
    case "pothole":
      return "bg-orange-100 text-orange-700";
    case "accident":
      return "bg-red-100 text-red-700";
    case "flood":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusLabel(status: HistoryRow["status"]) {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return "";
  }
}

function getStatusBadgeClass(status: HistoryRow["status"]) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ProfileReportHistory() {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-gray-900">Lịch sử báo cáo</h3>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          aria-label="Lọc báo cáo"
        >
          <Filter className="h-4 w-4" />
          Lọc
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="whitespace-nowrap px-3 py-3">ID</th>
              <th className="whitespace-nowrap px-3 py-3">Loại</th>
              <th className="min-w-[200px] px-3 py-3">Địa chỉ</th>
              <th className="whitespace-nowrap px-3 py-3">Ngày</th>
              <th className="whitespace-nowrap px-3 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {reportHistory.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="px-3 py-3 font-semibold text-gray-800">
                  {item.id}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeBadgeClass(item.type)}`}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                </td>
                <td className="px-3 py-3 text-gray-700">{item.address}</td>
                <td className="whitespace-nowrap px-3 py-3 text-gray-600">
                  {item.date}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.status)}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
