import { Routes, Route, Navigate } from "react-router-dom";

import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main */}
      <Route path="/map" element={<MapPage />} />
      <Route path="/report" element={<ReportPage />} />

      {/* fallback nếu sai đường dẫn */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}