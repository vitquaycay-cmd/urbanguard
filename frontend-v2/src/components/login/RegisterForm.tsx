import { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(e, { fullname, username });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="register-fullname">HỌ VÀ TÊN</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">👤</span>
          <input
            id="register-fullname"
            type="text"
            placeholder="Nguyễn Văn A"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="register-username">TÊN ĐĂNG NHẬP</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">🆔</span>
          <input
            id="register-username"
            type="text"
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="register-email">EMAIL</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">✉️</span>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={onChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="register-password">MẬT KHẨU</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">🔒</span>
          <input
            id="register-password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            onFocus={onPasswordFocus}
            onBlur={onPasswordBlur}
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="register-confirm-password">XÁC NHẬN MẬT KHẨU</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">⏺</span>
          <input
            id="register-confirm-password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={onChange}
            onFocus={onPasswordFocus}
            onBlur={onPasswordBlur}
            disabled={loading}
          />
        </div>
      </div>

      {error && <p className="auth-error-msg">{error}</p>}

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản →"}
      </button>
    </form>
  );
}
