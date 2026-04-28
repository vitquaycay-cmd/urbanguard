import { useState } from "react";
import { AtSign, Eye, EyeOff, User } from "lucide-react";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormProps = {
  formData: RegisterFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    extras: { fullname: string; username: string },
  ) => void | Promise<void>;
  onPasswordFocus?: () => void;
  onPasswordBlur?: () => void;
  error?: string | null;
  loading?: boolean;
};

const IconEmail = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const IconLock = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="9,12 11,14 15,10" />
  </svg>
);

export default function RegisterForm({
  formData,
  onChange,
  onSubmit,
  onPasswordFocus,
  onPasswordBlur,
  error,
  loading,
}: RegisterFormProps) {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(e, { fullname, username });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="register-fullname"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500"
        >
          HỌ VÀ TÊN
        </label>
        <div className="relative">
          <User
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="register-fullname"
            type="text"
            placeholder="Nguyễn Văn A"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="register-username"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500"
        >
          TÊN ĐĂNG NHẬP
        </label>
        <div className="relative">
          <AtSign
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="register-username"
            type="text"
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="register-email"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          EMAIL
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-green-500">
          <span className="flex shrink-0 items-center justify-center opacity-80">
            <IconEmail />
          </span>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={onChange}
            disabled={loading}
            className="min-w-0 flex-1 border-0 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="register-password"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          MẬT KHẨU
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-green-500">
          <span className="flex shrink-0 items-center justify-center opacity-80">
            <IconLock />
          </span>
          <div className="relative min-w-0 flex-1">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={onChange}
              onFocus={onPasswordFocus}
              onBlur={onPasswordBlur}
              disabled={loading}
              className="w-full min-w-0 border-0 bg-transparent pr-10 text-base text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="register-confirm-password"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          XÁC NHẬN MẬT KHẨU
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-green-500">
          <span className="flex shrink-0 items-center justify-center opacity-80">
            <IconCheck />
          </span>
          <div className="relative min-w-0 flex-1">
            <input
              id="register-confirm-password"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={onChange}
              onFocus={onPasswordFocus}
              onBlur={onPasswordBlur}
              disabled={loading}
              className="w-full min-w-0 border-0 bg-transparent pr-10 text-base text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={
                showConfirm ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"
              }
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="m-0 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-70"
      >
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản →"}
      </button>
    </form>
  );
}
