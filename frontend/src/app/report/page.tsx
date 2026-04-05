"use client";

import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  createReportRequest,
  getStoredAccessToken,
  loginRequest,
  setStoredAccessToken,
} from "@/services/report.api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_LAT = 10.762622;
const DEFAULT_LNG = 106.660172;

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">(
    "idle",
  );
  const [submitBusy, setSubmitBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setToken(getStoredAccessToken());
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoStatus("ok");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleLogin = useCallback(async () => {
    setError(null);
    setLoginBusy(true);
    try {
      const res = await loginRequest(email, password);
      setStoredAccessToken(res.access_token);
      setToken(res.access_token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập lỗi");
    } finally {
      setLoginBusy(false);
    }
  }, [email, password]);

  const handleLogout = useCallback(() => {
    setStoredAccessToken(null);
    setToken(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token) {
      setError("Vui lòng đăng nhập trước.");
      return;
    }
    if (!file) {
      setError("Chọn ảnh sự cố.");
      return;
    }
    const t = title.trim();
    if (!t) {
      setError("Nhập tiêu đề ngắn.");
      return;
    }

    setError(null);
    setToast(null);
    setSubmitBusy(true);

    const description =
      t.length >= 3 ? `Gửi nhanh: ${t}` : `${t} — báo cáo từ UrbanGuard`;

    try {
      const report = await createReportRequest(token, {
        title: t,
        description,
        latitude: lat,
        longitude: lng,
        image: file,
      });

      const validated = String(report.status).toUpperCase() === "VALIDATED";
      setToast(
        validated
          ? `Báo cáo đã được ghi nhận (#${report.id}) — đã duyệt tự động, hiển thị trên bản đồ.`
          : `Báo cáo đã được ghi nhận (#${report.id}) — đang chờ duyệt; chỉ VALIDATED mới lên bản đồ.`,
      );

      setFile(null);
      setTitle("");
      setFileInputKey((k) => k + 1);

      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        router.push("/map");
      }, 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gửi thất bại");
    } finally {
      setSubmitBusy(false);
    }
  }, [token, file, title, lat, lng, router]);

  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900 flex flex-col">
      <header
        className="shrink-0 flex items-center justify-between px-4 pb-2"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/map"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 py-2 pr-2"
          >
            ← Bản đồ
          </Link>
        </motion.div>
        <h1 className="text-sm font-semibold text-zinc-800">Báo cáo sự cố</h1>
        <span className="w-16" aria-hidden />
      </header>

      <main className="flex-1 flex flex-col justify-end px-0 sm:px-4 pb-0 sm:pb-6 min-h-0">
        <motion.div
          initial={{ y: 56, opacity: 0.94 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-lg mx-auto overflow-hidden flex flex-col max-h-[min(92dvh,900px)] rounded-t-[1.75rem] sm:rounded-3xl border border-zinc-200/90 border-b-0 sm:border-b bg-white shadow-2xl shadow-zinc-900/12"
          style={{
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-zinc-200 shrink-0" />

          <div className="p-4 pt-3 overflow-y-auto flex-1 min-h-0 space-y-4">
            {!token ? (
              <Card elevated className="border-amber-200/80 bg-amber-50/90 p-4 space-y-3">
                <p className="text-xs font-semibold text-amber-950 uppercase tracking-wide">
                  Đăng nhập để gửi
                </p>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-amber-400/35"
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-amber-400/35"
                />
                <Button
                  variant="primary"
                  disabled={loginBusy}
                  className="w-full py-3"
                  onClick={() => void handleLogin()}
                >
                  {loginBusy ? "Đang đăng nhập…" : "Đăng nhập"}
                </Button>
              </Card>
            ) : (
              <Card className="flex items-center justify-between px-3 py-2.5 bg-zinc-50/90">
                <span className="text-xs font-medium text-zinc-600">
                  Đã đăng nhập
                </span>
                <Button
                  variant="ghost"
                  className="!py-2 !px-3 text-xs text-red-600"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </Card>
            )}

            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/80 overflow-hidden">
              <input
                key={fileInputKey}
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="block w-full relative aspect-[4/3] bg-zinc-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Xem trước"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/60 text-white text-xs py-2.5 text-center font-semibold backdrop-blur-sm">
                    Chạm để đổi ảnh
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center aspect-[4/3] cursor-pointer px-4 w-full"
                >
                  <span className="text-4xl text-red-500 mb-1" aria-hidden>
                    +
                  </span>
                  <span className="text-sm font-semibold text-zinc-800">
                    Chụp hoặc chọn ảnh
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 text-center">
                    JPEG, PNG, GIF, WebP · tối đa 5MB
                  </span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                Tiêu đề <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Ổ gà ngã tư, ngập nước…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-base font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-red-500/25"
              />
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Vị trí:{" "}
              {geoStatus === "loading" && "Đang lấy GPS…"}
              {geoStatus === "ok" && "Đã dùng vị trí hiện tại."}
              {geoStatus === "denied" &&
                "Dùng vị trí mặc định (HCM) — bật GPS để chính xác hơn."}
              {geoStatus === "idle" && "…"}
            </p>

            <Banner variant="danger" show={!!error} position="static">
              {error}
            </Banner>

            <Banner variant="warning" show={!!toast} position="static">
              {toast}
            </Banner>
          </div>

          <div className="p-4 pt-0 shrink-0 border-t border-zinc-100 bg-white">
            {submitBusy && (
              <motion.p
                animate={{ opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="text-center text-sm text-amber-800 font-semibold mb-3"
              >
                Đang phân tích bằng AI…
              </motion.p>
            )}
            <Button
              variant="danger"
              disabled={submitBusy || !token}
              className="w-full py-3.5 text-base"
              onClick={() => void handleSubmit()}
            >
              {submitBusy ? "Đang gửi…" : "Gửi báo cáo"}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
