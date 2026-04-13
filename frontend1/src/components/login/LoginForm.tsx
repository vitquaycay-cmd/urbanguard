type LoginFormData = {
  email: string;
  password: string;
};

type LoginFormProps = {
  formData: LoginFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onPasswordFocus?: () => void;
  onPasswordBlur?: () => void;
  error?: string | null;
  loading?: boolean;
};

const IconEmail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    <circle cx="12" cy="16" r="1" fill="#6b7280"/>
  </svg>
);

export default function LoginForm({
  formData,
  onChange,
  onSubmit,
  onPasswordFocus,
  onPasswordBlur,
  error,
  loading,
}: LoginFormProps) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-field">
        <label htmlFor="login-email">EMAIL</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconEmail /></span>
          <input
            id="login-email"
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
        <label htmlFor="login-password">MẬT KHẨU</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconLock /></span>
          <input
            id="login-password"
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

      {error && (
        <p style={{ color: "#dc2626", fontSize: "14px", margin: "0" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
      </button>
    </form>
  );
}