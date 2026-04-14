import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import AuthBear from "./AuthBear";

type LoginCardProps = {
  children: ReactNode;
  isPasswordFocused?: boolean;
};

export default function LoginCard({
  children,
  isPasswordFocused = false,
}: LoginCardProps) {
  return (
    <div className="auth-card">
      <div className="auth-brand">
        <AuthBear isPasswordFocused={isPasswordFocused} />

        <h1 className="auth-logo">UrbanGuard</h1>

        <p className="auth-subtitle">
          🛡️ Hệ thống cảnh báo sự cố giao thông đô thị
        </p>
      </div>

      <div className="auth-tabs">
        <Link to="/login" className="auth-tab active">
          Đăng nhập
        </Link>

        <Link to="/register" className="auth-tab">
          Đăng ký
        </Link>
      </div>

      {children}
    </div>
  );
}