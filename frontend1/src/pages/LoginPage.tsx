import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginCard from "../components/login/LoginCard";
import LoginForm from "../components/login/LoginForm";
import "../styles/auth.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email || !formData.password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    alert("Đăng nhập thành công giả lập.");
    navigate("/map");
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
        />
      </LoginCard>
    </div>
  );
}