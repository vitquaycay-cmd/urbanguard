import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginCard from "@/components/login/LoginCard";
import LoginForm from "@/components/login/LoginForm";
import {
  loginRequest,
  setStoredAccessToken,
  setStoredRefreshToken,
} from "@/services/auth.api";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // 🔗 KẾT NỐI: Hook để refresh trạng thái auth
import "@/styles/auth.css"; // 🔗 KẾT NỐI: Style gốc của người dùng

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useCurrentUser(); // 🔗 KẾT NỐI: Lấy hàm refreshUser

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginRequest(formData.email, formData.password);
      setStoredAccessToken(res.access_token);
      setStoredRefreshToken(res.refresh_token);
      
      // 🔗 KẾT NỐI: Refresh user ngay sau khi login thành công để ProtectedRoute nhận diện được role
      await refreshUser();
      
      navigate("/map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid" />
      
      <LoginCard isPasswordFocused={isPasswordFocused}>
        <LoginForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onPasswordFocus={() => setIsPasswordFocused(true)}
          onPasswordBlur={() => setIsPasswordFocused(false)}
          error={error}
          loading={loading}
        />
      </LoginCard>
    </div>
  );
}