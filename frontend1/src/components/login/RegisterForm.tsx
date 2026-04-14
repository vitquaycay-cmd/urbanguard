type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormProps = {
  formData: RegisterFormData;
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

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="9,12 11,14 15,10"/>
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
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-field">
        <label htmlFor="register-email">EMAIL</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon"><IconEmail /></span>
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
          <span className="auth-input-icon"><IconLock /></span>
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
          <span className="auth-input-icon"><IconCheck /></span>
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
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản →"}
      </button>
    </form>
  );
}