import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/landing.css";

type GeoPoint = { lat: number; lon: number; fallback?: boolean };
type LandFeature = { type: "FeatureCollection"; features: Array<{ geometry: GeoGeometry | null }> };
type GeoGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export default function LandingPage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  const phase1Ref = useRef<HTMLDivElement | null>(null);
  const landingRef = useRef<HTMLDivElement | null>(null);
  const titleBlockRef = useRef<HTMLElement | null>(null);
  const statusBlockRef = useRef<HTMLElement | null>(null);
  const globeRef = useRef<HTMLCanvasElement | null>(null);
  const heroGlobeRef = useRef<HTMLCanvasElement | null>(null);
  const ticksRef = useRef<SVGGElement | null>(null);
  const statusLineRef = useRef<HTMLSpanElement | null>(null);
  const coordsRef = useRef<HTMLDivElement | null>(null);
  const latRef = useRef<HTMLSpanElement | null>(null);
  const lonRef = useRef<HTMLSpanElement | null>(null);
  const loginTimeoutRef = useRef<number | null>(null);

  function handleLogin() {
    setShowWelcome(true);
    loginTimeoutRef.current = window.setTimeout(() => {
      navigate("/login");
    }, 1800);
  }

  useEffect(() => {
    if (
      !globeRef.current ||
      !heroGlobeRef.current ||
      !ticksRef.current ||
      !phase1Ref.current ||
      !landingRef.current ||
      !titleBlockRef.current ||
      !statusBlockRef.current ||
      !coordsRef.current ||
      !statusLineRef.current ||
      !latRef.current ||
      !lonRef.current
    ) {
      return;
    }
    const canvas = globeRef.current!;
    const heroCanvas = heroGlobeRef.current!;
    const ticks = ticksRef.current!;
    const phase1 = phase1Ref.current!;
    const landing = landingRef.current!;
    const titleBlock = titleBlockRef.current!;
    const statusBlock = statusBlockRef.current!;
    const coordsEl = coordsRef.current!;
    const statusLineEl = statusLineRef.current!;
    const latEl = latRef.current!;
    const lonEl = lonRef.current!;
    const ctx = canvas.getContext("2d")!;
    const heroCtx = heroCanvas.getContext("2d")!;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const DEG = Math.PI / 180;
    const FALLBACK: GeoPoint = { lat: 21.0285, lon: 105.8542, fallback: true };

    let cx = 0;
    let cy = 0;
    let R = 0;
    let scaleMul = 1;
    let userPos: GeoPoint | null = null;
    let marker: GeoPoint | null = null;
    let world: LandFeature | null = null;
    let geoResolved = false;
    const rot = { lambda: 0, phi: -18 };
    let rafMain: number | null = null;
    let rafHero: number | null = null;

    let heroLambda = 0;
    let heroCx = 0;
    let heroCy = 0;
    let heroR = 0;

    function setStatus(text: string) {
      statusLineEl.textContent = text;
    }

    function fmtCoord(v: number, axis: "lat" | "lon") {
      const dir =
        axis === "lat" ? (v >= 0 ? "N" : "S") : v >= 0 ? "E" : "W";
      const abs = Math.abs(v);
      const d = Math.floor(abs);
      const m = Math.floor((abs - d) * 60);
      const s = ((abs - d) * 60 - m) * 60;
      return `${d}° ${String(m).padStart(2, "0")}′ ${s.toFixed(1).padStart(4, "0")}″ ${dir}`;
    }

    function fitMain() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      cx = canvas.width / 2;
      cy = canvas.height / 2;
      const vmin = Math.min(window.innerWidth, window.innerHeight);
      R = vmin * 0.18 * dpr;
    }

    function fitHero() {
      const rect = heroCanvas.getBoundingClientRect();
      heroCanvas.width = Math.round(rect.width * dpr);
      heroCanvas.height = Math.round(rect.height * dpr);
      heroCanvas.style.width = `${rect.width}px`;
      heroCanvas.style.height = `${rect.height}px`;
      heroCx = heroCanvas.width / 2;
      heroCy = heroCanvas.height / 2;
      heroR = Math.min(heroCanvas.width, heroCanvas.height) * 0.36;
    }

    function project(
      lon: number,
      lat: number,
    ): { x: number; y: number; visible: boolean } {
      const l = (lon + rot.lambda) * DEG;
      const p = lat * DEG;
      const ph = rot.phi * DEG;
      const cp = Math.cos(p);
      const x = cp * Math.sin(l);
      const y = Math.sin(p);
      const z = cp * Math.cos(l);
      const cph = Math.cos(ph);
      const sph = Math.sin(ph);
      const ny = y * cph - z * sph;
      const nz = y * sph + z * cph;
      return { x: cx + R * scaleMul * x, y: cy - R * scaleMul * ny, visible: nz > 0 };
    }

    function drawSphere() {
      const r = R * scaleMul;
      const grad = ctx.createRadialGradient(
        cx - r * 0.35,
        cy - r * 0.4,
        r * 0.1,
        cx,
        cy,
        r * 1.05,
      );
      grad.addColorStop(0, "#fbfaf6");
      grad.addColorStop(0.45, "#eef7ef");
      grad.addColorStop(0.85, "#d6ecdb");
      grad.addColorStop(1, "#bcdcc4");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = "rgba(21,128,61,0.85)";
      ctx.stroke();
    }

    function withSphereClip(drawFn: () => void) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R * scaleMul, 0, Math.PI * 2);
      ctx.clip();
      drawFn();
      ctx.restore();
    }

    function drawGraticule() {
      ctx.lineWidth = 0.5 * dpr;
      ctx.strokeStyle = "rgba(21,128,61,0.28)";
      for (let lon = -180; lon < 180; lon += 15) {
        ctx.beginPath();
        let started = false;
        for (let lat = -88; lat <= 88; lat += 2) {
          const p = project(lon, lat);
          if (!p.visible) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
    }

    function drawGeoFill(feature: LandFeature) {
      const drawGeometry = (geom: GeoGeometry | null) => {
        if (!geom) return;
        const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
        for (const poly of polys) {
          for (const ring of poly) {
            let started = false;
            for (const [lon, lat] of ring) {
              const p = project(lon, lat);
              if (p.visible) {
                if (!started) {
                  ctx.moveTo(p.x, p.y);
                  started = true;
                } else ctx.lineTo(p.x, p.y);
              } else started = false;
            }
          }
        }
      };
      ctx.beginPath();
      feature.features.forEach((f) => drawGeometry(f.geometry));
      ctx.fillStyle = "#15803d";
      ctx.fill("evenodd");
    }

    function drawMarker(t: number) {
      if (!marker) return;
      const p = project(marker.lon, marker.lat);
      if (!p.visible) return;
      const pulse = 0.5 + 0.5 * Math.sin(t / 280);
      const rDot = 4 * dpr;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rDot + 6 * dpr + pulse * 8 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(22,163,74,${0.25 * (1 - pulse)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, rDot, 0, Math.PI * 2);
      ctx.fillStyle = "#16a34a";
      ctx.fill();
    }

    function drawMain(now: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSphere();
      withSphereClip(() => {
        drawGraticule();
        if (world) drawGeoFill(world);
      });
      drawMarker(now);
    }

    function heroProject(lon: number, lat: number) {
      const l = (lon + heroLambda) * DEG;
      const p = lat * DEG;
      const phi = -18 * DEG;
      const cp = Math.cos(p);
      const x = cp * Math.sin(l);
      const y = Math.sin(p);
      const z = cp * Math.cos(l);
      const cph = Math.cos(phi);
      const sph = Math.sin(phi);
      const ny = y * cph - z * sph;
      const nz = y * sph + z * cph;
      return { x: heroCx + heroR * x, y: heroCy - heroR * ny, visible: nz > 0 };
    }

    function drawHero() {
      heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
      const g = heroCtx.createRadialGradient(
        heroCx - heroR * 0.4,
        heroCy - heroR * 0.4,
        heroR * 0.1,
        heroCx,
        heroCy,
        heroR,
      );
      g.addColorStop(0, "#f1faf3");
      g.addColorStop(0.6, "#bbf7d0");
      g.addColorStop(1, "#15803d");
      heroCtx.fillStyle = g;
      heroCtx.beginPath();
      heroCtx.arc(heroCx, heroCy, heroR, 0, Math.PI * 2);
      heroCtx.fill();

      if (world) {
        heroCtx.beginPath();
        for (const f of world.features) {
          const geom = f.geometry;
          if (!geom) continue;
          const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
          for (const poly of polys) {
            for (const ring of poly) {
              let started = false;
              for (const [lon, lat] of ring) {
                const p = heroProject(lon, lat);
                if (p.visible) {
                  if (!started) {
                    heroCtx.moveTo(p.x, p.y);
                    started = true;
                  } else heroCtx.lineTo(p.x, p.y);
                } else started = false;
              }
            }
          }
        }
        heroCtx.fillStyle = "#15803d";
        heroCtx.fill("evenodd");
      }
    }

    function heroLoop(time: number) {
      heroLambda = (heroLambda + 0.02 * time * 0.001) % 360;
      drawHero();
      rafHero = requestAnimationFrame(heroLoop);
    }

    function endIntro() {
      titleBlock.classList.add("fade-out", "lift");
      statusBlock.classList.add("fade-out");
      phase1.classList.add("hidden");
      window.setTimeout(() => {
        landing.classList.add("visible");
        rafHero = requestAnimationFrame(heroLoop);
      }, 400);
    }

    function shortestLambdaTarget(cur: number, des: number) {
      let c = ((cur % 360) + 540) % 360 - 180;
      let t = ((des % 360) + 540) % 360 - 180;
      let d = t - c;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      return c + d;
    }

    async function requestPosition(): Promise<GeoPoint | null> {
      if (!("geolocation" in navigator)) return null;
      return new Promise((resolve) => {
        const t = window.setTimeout(() => resolve(null), 5500);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            window.clearTimeout(t);
            resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          },
          () => {
            window.clearTimeout(t);
            resolve(null);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
        );
      });
    }

    async function loadWorld() {
      type Topology = {
        transform?: { translate: [number, number]; scale: [number, number] };
        arcs: number[][][];
        objects: { land: { geometries: Array<{ type: "Polygon" | "MultiPolygon"; arcs: number[][] | number[][][] }> } };
      };

      const topo = (await fetch(
        "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json",
      ).then((r) => r.json())) as Topology;
      const tx = topo.transform?.translate ?? [0, 0];
      const sc = topo.transform?.scale ?? [1, 1];

      const decodeArc = (i: number): number[][] => {
        const reverse = i < 0;
        const idx = reverse ? ~i : i;
        const arc = topo.arcs[idx] ?? [];
        const out: number[][] = [];
        let x = 0;
        let y = 0;
        for (const p of arc) {
          x += p[0];
          y += p[1];
          out.push([x * sc[0] + tx[0], y * sc[1] + tx[1]]);
        }
        return reverse ? out.reverse() : out;
      };

      const ring = (arcIdx: number[]): number[][] => {
        const c: number[][] = [];
        arcIdx.forEach((a, i) => {
          const d = decodeArc(a);
          if (i === 0) c.push(...d);
          else c.push(...d.slice(1));
        });
        return c;
      };

      const features = topo.objects.land.geometries.map((g) => {
        if (g.type === "Polygon") {
          return { geometry: { type: "Polygon", coordinates: (g.arcs as number[][]).map(ring) } as GeoGeometry };
        }
        return {
          geometry: {
            type: "MultiPolygon",
            coordinates: (g.arcs as number[][][]).map((poly) => poly.map(ring)),
          } as GeoGeometry,
        };
      });
      world = { type: "FeatureCollection", features };
    }

    fitMain();
    fitHero();

    const resizeHandler = () => {
      fitMain();
      fitHero();
    };
    window.addEventListener("resize", resizeHandler);

    let ticksHtml = "";
    for (let i = 0; i < 60; i += 1) {
      const a = (i / 60) * 360;
      const long = i % 5 === 0;
      const r1 = long ? 78 : 80;
      const r2 = 82;
      ticksHtml += `<line transform="rotate(${a} 100 100)" x1="100" y1="${100 - r2}" x2="100" y2="${100 - r1}" />`;
    }
    ticks.innerHTML = ticksHtml;

    const PHASE = { SPIN: 0, ZOOM: 1, OUT: 2 };
    let phase: number = PHASE.SPIN;
    let phaseStart = performance.now();
    let lastFrame = performance.now();
    const SPIN_MS = 3000;
    const ZOOM_MS = 3000;
    let spinSpeed = 32;
    let zoomStartScale = 1;
    let zoomTargetScale = 4.5;
    let zoomStartLambda = 0;
    let zoomStartPhi = -18;
    let zoomTargetLambda = 0;
    let zoomTargetPhi = 0;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function startZoomPhase() {
      phase = PHASE.ZOOM;
      phaseStart = performance.now();
      setStatus(userPos?.fallback ? "Sử dụng vị trí mặc định" : "Đang định vị tọa độ của bạn");
      const targetLambda = -(userPos?.lon ?? FALLBACK.lon);
      const targetPhi = -(userPos?.lat ?? FALLBACK.lat);
      zoomStartLambda = rot.lambda;
      zoomStartPhi = rot.phi;
      zoomTargetLambda = shortestLambdaTarget(zoomStartLambda, targetLambda);
      zoomTargetPhi = targetPhi;
      zoomStartScale = scaleMul;
      zoomTargetScale = 4.5;
      coordsEl.style.opacity = "1";
      latEl.textContent = fmtCoord(userPos?.lat ?? FALLBACK.lat, "lat");
      lonEl.textContent = fmtCoord(userPos?.lon ?? FALLBACK.lon, "lon");
      marker = { lat: userPos?.lat ?? FALLBACK.lat, lon: userPos?.lon ?? FALLBACK.lon };
    }

    function mainLoop(now: number) {
      const dt = Math.min(64, now - lastFrame) / 1000;
      lastFrame = now;
      const elapsed = now - phaseStart;

      if (phase === PHASE.SPIN) {
        rot.lambda = (rot.lambda + spinSpeed * dt) % 360;
        if (elapsed >= SPIN_MS && geoResolved) startZoomPhase();
        else if (elapsed >= SPIN_MS + 4000) {
          userPos = FALLBACK;
          geoResolved = true;
          startZoomPhase();
        }
      } else if (phase === PHASE.ZOOM) {
        const t = Math.min(1, elapsed / ZOOM_MS);
        const e = easeInOutCubic(t);
        const spinT = Math.min(1, t / 0.6);
        const speed = spinSpeed * (1 - easeOutCubic(spinT));
        rot.lambda = lerp(zoomStartLambda, zoomTargetLambda, e) + (1 - spinT) * speed * dt;
        rot.phi = lerp(zoomStartPhi, zoomTargetPhi, e);
        scaleMul = lerp(zoomStartScale, zoomTargetScale, e);
        if (t >= 1) {
          phase = PHASE.OUT;
          endIntro();
        }
      }

      drawMain(now);
      if (phase !== PHASE.OUT) rafMain = requestAnimationFrame(mainLoop);
    }

    void loadWorld();
    void requestPosition().then((pos) => {
      userPos = pos ?? FALLBACK;
      geoResolved = true;
    });

    rafMain = requestAnimationFrame(mainLoop);

    return () => {
      if (rafMain) cancelAnimationFrame(rafMain);
      if (rafHero) cancelAnimationFrame(rafHero);
      window.removeEventListener("resize", resizeHandler);
      if (loginTimeoutRef.current) {
        window.clearTimeout(loginTimeoutRef.current);
      }
    };
  }, [navigate]);

  return (
    <>
      <div className="phase1" ref={phase1Ref}>
        <div className="stars" aria-hidden="true" />
        <div className="globe-stage">
          <div className="halo" aria-hidden="true" />
          <div className="whirl">
            <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="rgba(15,31,21,0.45)"
                strokeWidth="0.4"
                strokeDasharray="1.2 3.5"
              />
              <g stroke="rgba(15,31,21,0.55)" strokeWidth="0.5" fill="none">
                <g ref={ticksRef} />
              </g>
              <g className="ring-a" fill="none" stroke="#15803d" strokeLinecap="round">
                <circle cx="100" cy="100" r="92" strokeWidth="0.6" strokeDasharray="22 70 6 80 4 380" opacity="0.9" />
              </g>
              <g className="ring-b" fill="none" stroke="#22c55e" strokeLinecap="round">
                <circle cx="100" cy="100" r="98" strokeWidth="0.5" strokeDasharray="1 6" opacity="0.55" />
              </g>
              <g className="ring-c" fill="none" stroke="#16a34a" strokeLinecap="round">
                <circle cx="100" cy="100" r="104" strokeWidth="0.4" strokeDasharray="60 320" opacity="0.6" />
              </g>
            </svg>
          </div>
          <canvas className="globe" ref={globeRef} />
          <div className="sweep" aria-hidden="true" />
        </div>

        <section className="title-block" ref={titleBlockRef}>
          <div className="eyebrow">
            <span className="bar" />
            UrbanGuard
            <span className="bar" />
          </div>
          <h1 className="display">
            Urban<em>Guard</em>
          </h1>
          <div className="title-sub">Traffic Safety Monitor</div>
        </section>

        <section className="status-block" ref={statusBlockRef}>
          <div className="line">
            <span className="pulse" />
            <span ref={statusLineRef}>Đang định vị...</span>
          </div>
          <div className="coords" ref={coordsRef}>
            <span ref={latRef}>— —</span>
            <span className="sep">/</span>
            <span ref={lonRef}>— —</span>
          </div>
        </section>
      </div>

      <div className="landing" ref={landingRef}>
        <nav className="landing-nav">
          <span className="brand">UrbanGuard</span>
          <span className="nav-links">
            <a href="#for-citizens">Người dân</a>
            <a href="#for-agencies">Cơ quan</a>
            <a href="#about">Giới thiệu</a>
          </span>
          <button type="button" className="login-cta" onClick={handleLogin}>
            Đăng nhập →
          </button>
        </nav>

        <section className="hero">
          <div className="hero-text">
            <div className="eyebrow-l">
              <span className="bar" />
              Traffic Safety Monitor
            </div>
            <h1>
              An toàn
              <br />
              <em>đô thị</em>, mỗi con đường.
            </h1>
            <p className="lede">
              Nền tảng báo cáo và giám sát sự cố giao thông theo thời gian thực —
              kết nối người dân và cơ quan quản lý để phản ứng nhanh, chính xác.
            </p>
            <div className="hero-ctas">
              <button type="button" className="btn-primary" onClick={handleLogin}>
                Đăng nhập →
              </button>
              <a href="#for-citizens" className="btn-ghost">
                Tìm hiểu thêm
              </a>
            </div>
          </div>
          <div className="hero-globe">
            <div className="h-whirl">
              <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(21,128,61,0.4)" strokeWidth="0.4" strokeDasharray="1.2 3.5" />
                <g className="h-ring-a" fill="none" stroke="#16a34a" strokeLinecap="round">
                  <circle cx="100" cy="100" r="94" strokeWidth="0.5" strokeDasharray="22 70 6 80 4 380" opacity="0.7" />
                </g>
                <g className="h-ring-b" fill="none" stroke="#22c55e" strokeLinecap="round">
                  <circle cx="100" cy="100" r="100" strokeWidth="0.4" strokeDasharray="60 320" opacity="0.5" />
                </g>
              </svg>
            </div>
            <canvas ref={heroGlobeRef} />
          </div>
        </section>

        <section className="audience" id="for-citizens">
          <div className="audience-head">
            <div>
              <div className="label">Dành cho người dân</div>
              <h2>
                Báo cáo một sự cố, bảo vệ <em>cả cộng đồng</em>.
              </h2>
            </div>
          </div>
        </section>

        <section className="audience alt" id="for-agencies">
          <div className="audience-head">
            <div>
              <div className="label">Dành cho cơ quan quản lý</div>
              <h2>
                Dữ liệu sống cho <em>quyết định nhanh</em>.
              </h2>
            </div>
          </div>
        </section>

        <section className="closing-cta" id="about">
          <h2>
            Sẵn sàng <em>bắt đầu?</em>
          </h2>
          <p>Đăng nhập để truy cập bản đồ sự cố của khu vực bạn.</p>
          <button type="button" className="btn-primary" onClick={handleLogin}>
            Đăng nhập →
          </button>
        </section>

        <footer className="footer">
          <span>© 2026 UrbanGuard · Traffic Safety Monitor</span>
          <span>Made for safer streets</span>
        </footer>
      </div>

      <div className={`welcome ${showWelcome ? "visible" : ""}`}>
        <div className="welcome-text">
          <h2>
            Chào mừng bạn đến với <em>UrbanGuard</em>
          </h2>
          <p>Đang khởi tạo hệ thống...</p>
        </div>
      </div>
    </>
  );
}
