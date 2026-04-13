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
};

export default function RegisterForm({
  formData,
  onChange,
  onSubmit,
  onPasswordFocus,
  onPasswordBlur,
}: RegisterFormProps) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
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
          />
        </div>
      </div>

      <button type="submit" className="auth-submit-btn">
        Tạo tài khoản →
      </button>
    </form>
  );
}