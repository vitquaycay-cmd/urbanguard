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
};

export default function LoginForm({
  formData,
  onChange,
  onSubmit,
  onPasswordFocus,
  onPasswordBlur,
}: LoginFormProps) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-field">
        <label htmlFor="login-email">EMAIL</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">✉️</span>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="login-password">MẬT KHẨU</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">🔒</span>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            onFocus={onPasswordFocus}
            onBlur={onPasswordBlur}
          />
        </div>
      </div>

      <button type="submit" className="auth-submit-btn">
        Đăng nhập →
      </button>
    </form>
  );
}