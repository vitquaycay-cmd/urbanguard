import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RegisterCard from "../components/login/RegisterCard";
import RegisterForm from "../components/login/RegisterForm";
import { registerRequest } from "@/services/auth.api";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Gọi API đăng ký thật
      await registerRequest(formData.email, formData.password);
      // Đăng ký thành công → chuyển sang trang đăng nhập
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid" />

      <RegisterCard isPasswordFocused={isPasswordFocused}>
        <RegisterForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onPasswordFocus={() => setIsPasswordFocused(true)}
          onPasswordBlur={() => setIsPasswordFocused(false)}
          error={error}
          loading={loading}
        />
      </RegisterCard>
    </div>
  );
}
