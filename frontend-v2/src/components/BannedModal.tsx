import { ShieldOff } from "lucide-react";
import { removeStoredTokens } from "@/services/auth.api";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
}

export default function BannedModal({ open }: Props) {
  const navigate = useNavigate();

  if (!open) return null;

  function handleOk() {
    removeStoredTokens();
    navigate("/login");
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tài khoản bị khóa
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ admin
          để được hỗ trợ.
        </p>
        <button
          type="button"
          onClick={handleOk}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
