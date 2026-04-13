import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RegisterCard from "../components/login/RegisterCard";
import RegisterForm from "../components/login/RegisterForm";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    alert("Đăng ký thành công.");
    navigate("/login");
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
        />
      </RegisterCard>
    </div>
  );
}