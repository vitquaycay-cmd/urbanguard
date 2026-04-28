type AuthBearProps = {
  isPasswordFocused?: boolean;
};

export default function AuthBear({ isPasswordFocused = false }: AuthBearProps) {
  const eyeStyle = (show: boolean) => ({
    opacity: isPasswordFocused ? (show ? 0 : 1) : show ? 1 : 0,
    transition: "opacity 0.3s ease",
  });

  return (
    <div className="mb-4 flex justify-center">
      <svg
        className="block h-[130px] w-[130px]"
        viewBox="0 0 200 200"
        width="130"
        height="130"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="headGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#5de888" />
            <stop offset="100%" stopColor="#29c95e" />
          </radialGradient>
          <radialGradient id="earInGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="100%" stopColor="#86efac" />
          </radialGradient>
          <radialGradient id="muzzleGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e0fdf0" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </radialGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="8"
              floodColor="#16a34a"
              floodOpacity="0.22"
            />
          </filter>
        </defs>

        <g filter="url(#glow)">
          {/* ── TAI TRÁI ── */}
          <circle cx="55" cy="68" r="20" fill="#29c95e" />
          <circle cx="55" cy="68" r="11" fill="url(#earInGrad)" />

          {/* ── TAI PHẢI ── */}
          <circle cx="145" cy="68" r="20" fill="#29c95e" />
          <circle cx="145" cy="68" r="11" fill="url(#earInGrad)" />
          {/* ── THÂN ── */}
          <ellipse cx="100" cy="165" rx="53" ry="42" fill="url(#headGrad)" />

          {/* ── ĐẦU – tròn vừa, tai nhô ra 2 bên ── */}
          <circle cx="100" cy="105" r="55" fill="url(#headGrad)" />

          {/* ── VÙNG MÕM ── */}
          <ellipse cx="100" cy="122" rx="22" ry="16" fill="url(#muzzleGrad)" />

          {/* ── MÁ ── */}
          <ellipse
            cx="70"
            cy="118"
            rx="8"
            ry="5.5"
            fill="#f9a8d4"
            opacity="0.5"
          />
          <ellipse
            cx="130"
            cy="118"
            rx="8"
            ry="5.5"
            fill="#f9a8d4"
            opacity="0.5"
          />

          {/* ── MẮT MỞ ── */}
          <ellipse
            cx="82"
            cy="103"
            rx="11"
            ry="12"
            fill="white"
            style={eyeStyle(true)}
          />
          <ellipse
            cx="118"
            cy="103"
            rx="11"
            ry="12"
            fill="white"
            style={eyeStyle(true)}
          />
          <circle
            cx="84"
            cy="105"
            r="7"
            fill="#0d1f0d"
            style={eyeStyle(true)}
          />
          <circle
            cx="120"
            cy="105"
            r="7"
            fill="#0d1f0d"
            style={eyeStyle(true)}
          />
          <circle
            cx="86"
            cy="101"
            r="2.8"
            fill="white"
            style={eyeStyle(true)}
          />
          <circle
            cx="122"
            cy="101"
            r="2.8"
            fill="white"
            style={eyeStyle(true)}
          />

          {/* ── MẮT NHẮM ── */}
          <path
            d="M71,103 Q82,115 93,103"
            stroke="#166534"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />
          <path
            d="M107,103 Q118,115 129,103"
            stroke="#166534"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />

          {/* lông mi trái */}
          <line
            x1="74"
            y1="106"
            x2="71"
            y2="111"
            stroke="#166534"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />
          <line
            x1="82"
            y1="113"
            x2="82"
            y2="118"
            stroke="#166534"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />
          <line
            x1="90"
            y1="106"
            x2="93"
            y2="111"
            stroke="#166534"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />
          {/* lông mi phải */}
          <line
            x1="110"
            y1="106"
            x2="107"
            y2="111"
            stroke="#166534"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />
          <line
            x1="118"
            y1="113"
            x2="118"
            y2="118"
            stroke="#166534"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />
          <line
            x1="126"
            y1="106"
            x2="129"
            y2="111"
            stroke="#166534"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={eyeStyle(false)}
          />

          {/* ── MŨI ── */}
          <ellipse cx="100" cy="119" rx="7.5" ry="5.5" fill="#166534" />
          <ellipse
            cx="100"
            cy="118"
            rx="3.5"
            ry="2.2"
            fill="#4ade80"
            opacity="0.45"
          />

          {/* ── MIỆNG ── */}
          <path
            d="M90,128 Q100,137 110,128"
            stroke="#166534"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
