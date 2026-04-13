import { Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/map" />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}