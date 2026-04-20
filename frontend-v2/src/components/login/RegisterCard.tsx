import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  Car,
  CircleDot,
  MapPin,
  Route,
  Shield,
  TriangleAlert,
  Zap,
} from "lucide-react";
import AuthBear from "./AuthBear";

type RegisterCardProps = {
  children: ReactNode;
  isPasswordFocused?: boolean;
};

export default function RegisterCard({
  children,
  isPasswordFocused = false,
}: RegisterCardProps) {
  const features = [
    {
      icon: MapPin,
      title: "Theo dõi điểm nóng",
      desc: "Bản đồ sự cố theo thời gian thực",
    },
    {
      icon: Shield,
      title: "An toàn đô thị",
      desc: "Cảnh báo và phối hợp phản ứng",
    },
    {
      icon: Zap,
      title: "Phản hồi nhanh",
      desc: "Luồng thông tin tức thì cho đội xử lý",
    },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="relative hidden min-h-screen w-full shrink-0 overflow-hidden bg-gradient-to-br from-green-700 to-green-500 md:block md:w-[40%]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Car
            className="absolute left-[4%] top-[8%] h-40 w-40 animate-float-1 text-white/10"
            style={{ animationDelay: '0s' }}
            strokeWidth={1}
            aria-hidden
          />
          <TriangleAlert
            className="absolute right-[6%] top-[18%] h-28 w-28 animate-float-2 text-white/10"
            style={{ animationDelay: '0.8s' }}
            strokeWidth={1}
            aria-hidden
          />
          <Route
            className="absolute bottom-[22%] left-[12%] h-24 w-24 animate-float-3 text-white/10"
            style={{ animationDelay: '1.5s' }}
            strokeWidth={1}
            aria-hidden
          />
          <MapPin
            className="absolute bottom-[12%] right-[8%] h-36 w-36 animate-float-4 text-white/10"
            style={{ animationDelay: '0.3s' }}
            strokeWidth={1}
            aria-hidden
          />
          <span
            className="absolute left-[40%] top-[42%] flex animate-float-5"
            style={{ animationDelay: '2s' }}
          >
            <CircleDot
              className="h-16 w-16 animate-spin-slow text-white/10"
              strokeWidth={1}
              aria-hidden
            />
          </span>
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-center px-10 py-12 lg:px-14">
          <Shield className="h-16 w-16 text-white" strokeWidth={1.25} aria-hidden />
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white">
            UrbanGuard
          </h2>
          <p className="mt-2 text-lg text-white/70">Traffic Safety Monitor</p>

          <ul className="mt-10 max-w-sm space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-4 text-white">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-0.5 block text-sm text-white/80">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-h-screen w-full min-w-0 flex-1 items-center justify-center bg-[#f0fdf4] px-4 py-10 md:py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <AuthBear isPasswordFocused={isPasswordFocused} />

          <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
            <NavLink
              to="/login"
              end
              className={({ isActive }) =>
                `flex-1 rounded-xl py-3 text-center text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-green-700 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              Đăng nhập
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `flex-1 rounded-xl py-3 text-center text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-green-700 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              Đăng ký
            </NavLink>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
