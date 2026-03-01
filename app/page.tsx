"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ── Local imports ─────────────────────────────────────────────────────────────
import {
  runEngine,
  CalcResult,
  VentilationType,
  RoomGeometry,
  ActivityLevel,
  AgeGroup,
  Condition,
} from "./lib/smokeEngine";
import { CHEMICALS, TOXICITY_COLORS, ChemicalName } from "./lib/chemicals";
import ShareModal from "./components/ShareModal";

// ─── Google Fonts + Global Styles ─────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --black: #06060a; --surface: #0e0e14;
      --card: rgba(255,255,255,0.035); --border: rgba(255,255,255,0.08);
      --orange: #ff5c1a; --amber: #ffb347;
      --white: #f5f3ee; --muted: rgba(245,243,238,0.45);
      --mono: 'DM Mono', monospace; --sans: 'Syne', sans-serif; --serif: 'Instrument Serif', serif;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--black); color: var(--white); font-family: var(--sans); -webkit-font-smoothing: antialiased; }

    @keyframes fadeUp    { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
    @keyframes gridPulse { 0%,100%{opacity:.4;} 50%{opacity:.7;} }
    @keyframes orb1      { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(60px,-40px) scale(1.1);} 66%{transform:translate(-30px,50px) scale(.95);} }
    @keyframes orb2      { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-70px,60px) scale(1.05);} 66%{transform:translate(50px,-30px) scale(.9);} }
    @keyframes pulseDot  { 0%,100%{box-shadow:0 0 0 0 rgba(255,92,26,.5);} 50%{box-shadow:0 0 0 8px rgba(255,92,26,0);} }
    @keyframes radioactive { 0%,100%{opacity:1;} 50%{opacity:.4;} }
    @keyframes slideIn   { from{opacity:0;transform:scale(.96) translateY(16px);} to{opacity:1;transform:scale(1) translateY(0);} }

    .fade-up{animation:fadeUp .7s ease both;}
    .delay-1{animation-delay:.1s;} .delay-2{animation-delay:.2s;} .delay-3{animation-delay:.3s;}
    .delay-4{animation-delay:.4s;} .delay-5{animation-delay:.5s;} .delay-6{animation-delay:.6s;} .delay-8{animation-delay:.8s;}

    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .glass { background:var(--card); border:1px solid var(--border); border-radius:20px; backdrop-filter:blur(12px); }
    .badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,92,26,.12); border:1px solid rgba(255,92,26,.3); border-radius:100px; padding:6px 14px; font-size:11px; font-weight:600; letter-spacing:.12em; color:var(--orange); text-transform:uppercase; }
    .badge-dot { width:6px; height:6px; border-radius:50%; background:var(--orange); animation:pulseDot 2s infinite; }

    .inp { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:12px; color:var(--white); font-family:var(--mono); font-size:14px; outline:none; transition:border-color .2s, background .2s; }
    .inp:focus { border-color:var(--orange); background:rgba(255,92,26,.06); }
    .inp-label { display:block; font-size:11px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }

    .stat-card { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:28px; position:relative; overflow:hidden; transition:border-color .3s, transform .3s; cursor:default; }
    .stat-card:hover { border-color:rgba(255,92,26,.35); transform:translateY(-3px); }
    .stat-card::before { content:''; position:absolute; inset:0; background:radial-gradient(60% 60% at 50% 0%, rgba(255,92,26,.08) 0%, transparent 100%); opacity:0; transition:opacity .3s; }
    .stat-card:hover::before { opacity:1; }

    .chem-row { transition:background .2s; }
    .chem-row:hover { background:rgba(255,255,255,.03); }
    .locale-btn { padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; border:1px solid transparent; cursor:pointer; transition:all .2s; font-family:var(--sans); }

    input[type=range] { -webkit-appearance:none; width:100%; height:4px; border-radius:4px; outline:none; cursor:pointer; background:rgba(255,255,255,.1); }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:var(--orange); border:3px solid var(--black); box-shadow:0 0 0 2px var(--orange); }

    .modal-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.75); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:24px; }
    .modal-box { background:#13131a; border:1px solid rgba(255,92,26,.3); border-radius:24px; padding:36px; max-width:480px; width:100%; animation:slideIn .3s ease; position:relative; }

    .promise-wrap { display:flex; align-items:center; gap:16px; margin:36px auto; max-width:480px; justify-content:center; }
    .promise-line { flex:1; height:1px; background:linear-gradient(90deg, transparent, rgba(255,92,26,.4)); }
    .promise-line.right { background:linear-gradient(90deg, rgba(255,92,26,.4), transparent); }
    .promise-text { font-family:var(--serif); font-style:italic; font-size:clamp(15px,2vw,18px); color:var(--orange); white-space:nowrap; }

    /* Share button */
    .share-btn { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; border-radius:100px; background:rgba(255,92,26,.12); border:1px solid rgba(255,92,26,.4); color:var(--orange); font-weight:700; font-size:14px; cursor:pointer; font-family:var(--sans); letter-spacing:-.01em; transition:background .2s, transform .15s; }
    .share-btn:hover { background:rgba(255,92,26,.2); transform:translateY(-2px); }

    /* Light mode */
    .light-mode { --black:#f5f0eb; --surface:#ede8e0; --card:rgba(0,0,0,0.04); --border:rgba(0,0,0,0.1); --white:#1a1612; --muted:rgba(26,22,18,0.5); }
    .light-mode body { background:#f5f0eb; color:#1a1612; }
    .light-mode .glass { background:rgba(255,255,255,0.75)!important; border-color:rgba(0,0,0,0.08)!important; }
    .light-mode .stat-card { background:rgba(255,255,255,0.75)!important; border-color:rgba(0,0,0,0.08)!important; }
    .light-mode .modal-box { background:#fff!important; }
    .light-mode nav { background:rgba(245,240,235,.9)!important; border-bottom-color:rgba(0,0,0,0.08)!important; }
    .light-mode .hero-grid { background-image:linear-gradient(rgba(0,0,0,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.06) 1px,transparent 1px)!important; }
    .light-mode .hero-vignette { background:radial-gradient(ellipse at center,transparent 30%,#f5f0eb 100%)!important; }
    .light-mode .source-note { background:rgba(255,179,71,.08)!important; color:rgba(180,120,0,.9)!important; }
    .light-mode .chem-table-header { background:rgba(0,0,0,.03)!important; }
    .light-mode .chem-row:hover { background:rgba(0,0,0,.02)!important; }
    .light-mode .footer-copyright { color:rgba(26,22,18,.3)!important; }
    .light-mode .modal-close-btn { background:rgba(0,0,0,.05)!important; color:#1a1612!important; }
    .light-mode input[type=range] { background:rgba(0,0,0,.12)!important; }
    .light-mode .nav-link:hover { background:rgba(0,0,0,.05); }
    .light-mode .mobile-menu { background:rgba(245,240,235,.97); }
    .light-mode .theme-btn { background:rgba(0,0,0,.05)!important; border-color:rgba(0,0,0,.12)!important; }

    /* Nav */
    .nav-link { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; font-size:13px; font-weight:600; color:var(--muted); text-decoration:none; background:transparent; border:none; cursor:pointer; font-family:var(--sans); letter-spacing:-.01em; transition:color .2s, background .2s; white-space:nowrap; }
    .nav-link:hover { color:var(--white); background:rgba(255,255,255,.06); }
    .nav-link.cta-link { background:var(--orange); color:#fff!important; padding:6px 16px; border-radius:100px; }
    .nav-link.cta-link:hover { background:#ff7a40; box-shadow:0 0 20px rgba(255,92,26,.3); }
    .nav-divider { width:1px; height:18px; background:var(--border); flex-shrink:0; }
    .hamburger { display:none; flex-direction:column; gap:5px; width:36px; height:36px; align-items:center; justify-content:center; background:transparent; border:1px solid var(--border); border-radius:8px; cursor:pointer; }
    .hamburger span { display:block; width:16px; height:2px; background:var(--white); border-radius:2px; transition:transform .2s, opacity .2s; }
    .mobile-menu { display:none; position:fixed; top:64px; left:0; right:0; background:rgba(6,6,10,.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); padding:16px 24px 24px; z-index:99; flex-direction:column; gap:4px; }
    .mobile-menu.open { display:flex; }
    .mobile-menu .nav-link { padding:12px 14px; font-size:15px; border-radius:10px; }
    .mobile-menu .nav-link.cta-link { margin-top:8px; text-align:center; justify-content:center; border-radius:100px; padding:12px; }
    .theme-btn { width:36px; height:36px; border-radius:10px; border:1px solid var(--border); background:rgba(255,255,255,.05); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; transition:background .2s, border-color .2s; }
    .theme-btn:hover { background:rgba(255,92,26,.15); border-color:rgba(255,92,26,.4); }
    ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:var(--black); } ::-webkit-scrollbar-thumb { background:rgba(255,92,26,.4); border-radius:3px; }

    .grid-3 { grid-template-columns:repeat(3,1fr); }
    .grid-2 { grid-template-columns:repeat(2,1fr); }
    .stats-strip { grid-template-columns:repeat(3,1fr); }
    .hero-btns { flex-direction:row; }
    @media (max-width:900px) { .nav-links{display:none!important;} .hamburger{display:flex!important;} }
    @media (max-width:768px) {
      .grid-3{grid-template-columns:1fr!important;} .grid-2{grid-template-columns:1fr!important;}
      .stats-strip{grid-template-columns:1fr!important;} .hero-btns{flex-direction:column!important; align-items:stretch!important;}
      .hero-btns a{text-align:center!important; justify-content:center!important;}
      .section-pad{padding-left:16px!important; padding-right:16px!important;}
      .calc-glass{padding:20px!important;} .modal-box{padding:24px!important; margin:16px!important;}
      .stat-card{padding:20px!important;} .nav-inner{padding:0 16px!important;}
    }
  `}</style>
);

// ─── Nav links config ─────────────────────────────────────────────────────────
const NAV_LINKS = (isHU: boolean) => [
  { label: isHU ? "Kalkulátor" : "Calculator", href: "#calculator" },
  { label: isHU ? "Vegyi anyagok" : "Chemicals", href: "#chemicals" },
  { label: isHU ? "Hírek" : "News", href: "/news", soon: true },
  {
    label: isHU ? "Szabályozások" : "Regulations",
    href: "/regulations",
    soon: true,
  },
  { label: isHU ? "Kutatás" : "Research", href: "/research", soon: true },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SmokeTracker() {
  const [isDark, setIsDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locale, setLocale] = useState("US");
  const [shareOpen, setShareOpen] = useState(false);

  // Calculator state
  const [years, setYears] = useState(10);
  const [cigsPerDay, setCigsPerDay] = useState(5);
  const [smokers, setSmokers] = useState(1);
  const [volumeM3, setVolumeM3] = useState(50);
  const [vent, setVent] = useState<VentilationType>("natural");
  const [geo, setGeo] = useState<RoomGeometry>("medium_room");
  const [distM, setDistM] = useState(2);
  const [tempC, setTempC] = useState(21);
  const [rh, setRh] = useState(50);
  const [furn, setFurn] = useState(true);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [activity, setActivity] = useState<ActivityLevel>("light");
  const [condition, setCondition] = useState<Condition>("none");
  const [weight, setWeight] = useState(70);
  const [result, setResult] = useState<CalcResult | null>(null);

  const [selectedChem, setSelectedChem] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isHU = locale === "HU";

  useEffect(() => {
    setResult(
      runEngine(
        cigsPerDay,
        smokers,
        years,
        volumeM3,
        vent,
        geo,
        distM,
        tempC,
        rh,
        furn,
        ageGroup,
        activity,
        condition,
        weight,
      ),
    );
  }, [
    cigsPerDay,
    smokers,
    years,
    volumeM3,
    vent,
    geo,
    distM,
    tempC,
    rh,
    furn,
    ageGroup,
    activity,
    condition,
    weight,
  ]);

  const chartData = result
    ? Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        cigs: Math.round((i + 1) * 365 * result.equivCigs),
      }))
    : [];

  const bioColor = result
    ? result.biomarker.interpretation === "background"
      ? "#4ade80"
      : result.biomarker.interpretation === "low"
        ? "#f59e0b"
        : result.biomarker.interpretation === "moderate"
          ? "#f97316"
          : "#ef4444"
    : "#4ade80";

  const SOON_TAG = (
    <span
      style={{
        fontSize: 9,
        fontFamily: "var(--mono)",
        fontWeight: 700,
        color: "var(--orange)",
        background: "rgba(255,92,26,.12)",
        border: "1px solid rgba(255,92,26,.25)",
        borderRadius: 4,
        padding: "1px 5px",
        marginLeft: 4,
      }}
    >
      SOON
    </span>
  );

  return (
    <>
      <FontLink />
      <div
        className={!isDark ? "light-mode" : ""}
        style={{
          background: "var(--black)",
          minHeight: "100vh",
          fontFamily: "var(--sans)",
          overflow: "hidden",
          transition: "background .3s, color .3s",
        }}
      >
        {/* ── NAV ── */}
        <nav
          className="nav-inner"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "rgba(6,6,10,.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            padding: "0 24px",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, var(--orange), #ff9f50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                💨
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "-.02em",
                  cursor: "pointer",
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <span style={{ color: "var(--white)" }}>invisible</span>
                <span style={{ color: "var(--orange)" }}>inhale</span>
              </span>
            </div>
            <div
              className="nav-links"
              style={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              {NAV_LINKS(isHU).map(({ label, href, soon }) => (
                <a
                  key={label}
                  href={soon ? undefined : href}
                  className="nav-link"
                  style={{
                    cursor: soon ? "default" : "pointer",
                    opacity: soon ? 0.5 : 1,
                  }}
                  onClick={soon ? (e) => e.preventDefault() : undefined}
                >
                  {label}
                  {soon && SOON_TAG}
                </a>
              ))}
              <div className="nav-divider" style={{ margin: "0 6px" }} />
              <a href="/quiz" className="nav-link cta-link">
                {isHU ? "Kvíz →" : "Quiz →"}
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="theme-btn" onClick={() => setIsDark(!isDark)}>
                {isDark ? "☀️" : "🌙"}
              </button>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  background: "rgba(255,255,255,.05)",
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                {["US", "HU"].map((l) => (
                  <button
                    key={l}
                    className="locale-btn"
                    onClick={() => setLocale(l)}
                    style={{
                      background:
                        locale === l ? "var(--orange)" : "transparent",
                      color: locale === l ? "#fff" : "var(--muted)",
                      border: "none",
                    }}
                  >
                    {l === "US" ? "🇺🇸 EN" : "🇭🇺 HU"}
                  </button>
                ))}
              </div>
              <button
                className="hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span
                  style={{
                    transform: menuOpen
                      ? "rotate(45deg) translate(5px,5px)"
                      : "none",
                  }}
                />
                <span style={{ opacity: menuOpen ? 0 : 1 }} />
                <span
                  style={{
                    transform: menuOpen
                      ? "rotate(-45deg) translate(5px,-5px)"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>
        </nav>

        {/* ── MOBILE MENU ── */}
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          {NAV_LINKS(isHU).map(({ label, href, soon }) => (
            <a
              key={label}
              href={soon ? undefined : href}
              className="nav-link"
              style={{
                opacity: soon ? 0.5 : 1,
                cursor: soon ? "default" : "pointer",
              }}
              onClick={(e) => {
                if (soon) e.preventDefault();
                else setMenuOpen(false);
              }}
            >
              {label}
              {soon && SOON_TAG}
            </a>
          ))}
          <a
            href="/quiz"
            className="nav-link cta-link"
            onClick={() => setMenuOpen(false)}
          >
            {isHU ? "Kvíz →" : "Quiz →"}
          </a>
        </div>

        {/* ── HERO ── */}
        <section
          className="section-pad"
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "120px 5vw 80px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            <div
              className="hero-grid"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)`,
                backgroundSize: "60px 60px",
                animation: "gridPulse 4s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: "10%",
                width: 600,
                height: 600,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(255,92,26,.15) 0%,transparent 70%)",
                animation: "orb1 18s ease-in-out infinite",
                filter: "blur(40px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10%",
                right: "5%",
                width: 500,
                height: 500,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(255,92,26,.1) 0%,transparent 70%)",
                animation: "orb2 22s ease-in-out infinite",
                filter: "blur(50px)",
              }}
            />
            <div
              className="hero-vignette"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center,transparent 30%,var(--black) 100%)",
              }}
            />
          </div>
          <div
            style={{
              zIndex: 1,
              maxWidth: "860px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div className="fade-up" style={{ marginBottom: 32 }}>
              <span className="badge">
                <span className="badge-dot" />
                {isHU
                  ? "Oktatási platform • Tudományos alapokon"
                  : "Secondhand smoke exposure platform • Science-backed data"}
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(38px,5vw,108px)",
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: "-.04em",
                marginBottom: 0,
                color: "var(--white)",
              }}
            >
              <span style={{ display: "block", overflow: "hidden" }}>
                <span
                  className="fade-up delay-1"
                  style={{ display: "inline-block" }}
                >
                  {isHU ? "A passzív dohányzás," : "Secondhand smoke is"}
                </span>
              </span>
              <span style={{ display: "block", overflow: "hidden" }}>
                <span
                  className="fade-up delay-2"
                  style={{ display: "inline-block" }}
                >
                  {isHU ? "avagy a" : "a hidden health threat"}
                </span>
              </span>
              <span style={{ display: "block", overflow: "hidden" }}>
                <span
                  className="fade-up delay-3"
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    background:
                      "linear-gradient(135deg,var(--orange) 0%,var(--amber) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {isHU ? "láthatatlan veszély" : "with invisible risks"}
                </span>
              </span>
            </h1>
            <div className="promise-wrap fade-up delay-4">
              <div className="promise-line" />
              <span className="promise-text">
                {isHU
                  ? "Láthatóvá tesszük a láthatatlant."
                  : "We make the invisible, visible."}
              </span>
              <div className="promise-line right" />
            </div>
            <div
              className="fade-up delay-5"
              style={{
                maxWidth: 560,
                margin: "0 auto 48px",
                textAlign: "center",
              }}
            >
              {(isHU
                ? [
                    "Nem te gyújtottál rá a cigarettára.",
                    "Nem te döntöttél úgy hogy ilyen káros levegőt lélegezz be.",
                    "Mégis megtörtént — otthon, autóban, vagy valaki mellett, akit szeretsz.",
                    "Az Invisible Inhale láthatóvá teszi a rejtett kitettséget. Először láthatod pontosan, mi kerül a tüdődbe engedélyed nélkül — és mit jelent ez az egészségedre nézve.",
                  ]
                : [
                    "You didn't light the cigarette.",
                    "You didn't choose to breathe it in.",
                    "But it happened — in your home, in a car, beside someone you love.",
                    "Invisible Inhale makes that hidden exposure visible. For the first time, see exactly what went into your lungs without your permission — and what it means for your health.",
                  ]
              ).map((line, i) => (
                <p
                  key={i}
                  style={{
                    fontSize:
                      i === 3
                        ? "clamp(14px,2vw,16px)"
                        : "clamp(15px,2.5vw,18px)",
                    color: i === 3 ? "var(--muted)" : "var(--white)",
                    lineHeight: 1.7,
                    marginBottom: i < 2 ? 2 : i === 2 ? 20 : 0,
                    fontWeight: i < 3 ? 600 : 400,
                    letterSpacing: i < 3 ? "-.01em" : "normal",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
            <div
              className="hero-btns fade-up delay-6"
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 80,
              }}
            >
              <a
                href="#calculator"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 32px",
                  borderRadius: 100,
                  background: "var(--orange)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  letterSpacing: "-.01em",
                  boxShadow: "0 0 40px rgba(255,92,26,.35)",
                }}
              >
                {isHU ? "Számold ki a kitettséged" : "Calculate My Exposure"} →
              </a>
              <a
                href="#chemicals"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 32px",
                  borderRadius: 100,
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--white)",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  letterSpacing: "-.01em",
                }}
              >
                {isHU ? "Vegyi anyagok" : "See Chemicals"}
              </a>
            </div>
            <div
              className="stats-strip fade-up delay-8"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 1,
                background: "var(--border)",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              {[
                {
                  val: "7,000+",
                  label: isHU ? "Vegyi anyag" : "Chemicals",
                  color: "var(--amber)",
                },
                {
                  val: "3,000+",
                  label: isHU ? "Rákkeltő anyag" : "Carcinogens",
                  color: "var(--orange)",
                },
                {
                  val: "0%",
                  label: isHU ? "Biztonságos szint" : "Safe Exposure",
                  color: "#ff2d55",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "28px 24px",
                    background: "var(--surface)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: s.color,
                      letterSpacing: "-.03em",
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 6,
                      fontFamily: "var(--mono)",
                      letterSpacing: ".08em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CALCULATOR ── */}
        <section
          id="calculator"
          className="section-pad"
          style={{ padding: "100px 5vw", position: "relative" }}
        >
          <div className="container">
            <div style={{ marginBottom: 48, textAlign: "center" }}>
              <div className="badge" style={{ marginBottom: 20 }}>
                <span className="badge-dot" />
                {isHU ? "Tudományos Motor" : "Scientific Exposure Engine"}
              </div>
              <h2
                style={{
                  fontSize: "clamp(32px,5vw,56px)",
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                {isHU ? "Kockázat Kalkulátor" : "Risk Calculator"}
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 15,
                  maxWidth: 560,
                  margin: "0 auto",
                  lineHeight: 1.7,
                }}
              >
                {isHU
                  ? "6 tudományos réteg: fizikai környezeti modell, többszennyezős kimenet, személyre szabott expozíció, biomarker becslés, egészségügyi kockázat és élettartam modell."
                  : "6 scientific layers: physical environment model, multi-pollutant output, person-specific exposure, biomarker estimation, health risk quantification, and lifetime model."}
              </p>
            </div>

            <div
              className="source-note"
              style={{
                background: "rgba(255,179,71,.06)",
                border: "1px solid rgba(255,179,71,.2)",
                borderRadius: 14,
                padding: "14px 20px",
                marginBottom: 32,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "rgba(255,179,71,.8)",
                lineHeight: 1.6,
              }}
            >
              {isHU
                ? "Modell: EPA CONTAM + Repace & Lowrey 1980 + WHO 2010 + Surgeon General 2006 + IARC Vol.83. Minden számítás a böngészőben történik."
                : "Model: EPA CONTAM + Repace & Lowrey 1980 + WHO 2010 + Surgeon General 2006 + IARC Vol.83. All calculations run locally in your browser — no data transmitted."}
            </div>

            {/* Input grid */}
            <div
              className="glass calc-glass"
              style={{ padding: 36, marginBottom: 24 }}
            >
              <div
                className="grid-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 20,
                  marginBottom: 28,
                }}
              >
                <div>
                  <label className="inp-label">
                    {isHU ? "Kitettség évei" : "Years Exposed"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={1}
                    max={50}
                    value={years || ""}
                    onChange={(e) => setYears(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="inp-label">
                    {isHU
                      ? "Cigaretta/nap (közelben)"
                      : "Cigarettes/Day Nearby"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={1}
                    max={60}
                    value={cigsPerDay || ""}
                    onChange={(e) => setCigsPerDay(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Dohányzók száma" : "Smokers Present"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={1}
                    max={10}
                    value={smokers || ""}
                    onChange={(e) => setSmokers(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Helyiség mérete (m³)" : "Room Volume (m³)"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={5}
                    max={500}
                    step={5}
                    value={volumeM3 || ""}
                    onChange={(e) => setVolumeM3(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Szellőztetés" : "Ventilation Type"}
                  </label>
                  <select
                    className="inp"
                    value={vent}
                    onChange={(e) => setVent(e.target.value as VentilationType)}
                  >
                    <option value="none">
                      {isHU ? "Nincs (0.3 ACH)" : "None (0.3 ACH)"}
                    </option>
                    <option value="natural">
                      {isHU
                        ? "Természetes (1.5 ACH)"
                        : "Natural Draft (1.5 ACH)"}
                    </option>
                    <option value="hvac">
                      {isHU ? "HVAC (4 ACH)" : "Mechanical HVAC (4 ACH)"}
                    </option>
                    <option value="hepa">
                      {isHU ? "HEPA szűrő (8 ACH)" : "HEPA Filtration (8 ACH)"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Helyiség geometria" : "Room Geometry"}
                  </label>
                  <select
                    className="inp"
                    value={geo}
                    onChange={(e) => setGeo(e.target.value as RoomGeometry)}
                  >
                    <option value="small_closed">
                      {isHU ? "Kis zárt szoba" : "Small Closed Room"}
                    </option>
                    <option value="medium_room">
                      {isHU ? "Átlagos szoba" : "Medium Room"}
                    </option>
                    <option value="open_plan">
                      {isHU ? "Nyitott alapterv" : "Open Plan"}
                    </option>
                    <option value="outdoor_partial">
                      {isHU ? "Részben kültéri" : "Partially Outdoor"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Távolság (m)" : "Distance from Smoker (m)"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={distM || ""}
                    onChange={(e) => setDistM(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Hőmérséklet (°C)" : "Temperature (°C)"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={10}
                    max={40}
                    value={tempC || ""}
                    onChange={(e) => setTempC(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Páratartalom (%)" : "Relative Humidity (%)"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={10}
                    max={95}
                    step={5}
                    value={rh || ""}
                    onChange={(e) => setRh(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Korcsoport" : "Age Group"}
                  </label>
                  <select
                    className="inp"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                  >
                    <option value="infant">
                      {isHU ? "Csecsemő (0–2)" : "Infant (0–2)"}
                    </option>
                    <option value="child">
                      {isHU ? "Gyermek (3–12)" : "Child (3–12)"}
                    </option>
                    <option value="teen">
                      {isHU ? "Tinédzser (13–17)" : "Teen (13–17)"}
                    </option>
                    <option value="adult">
                      {isHU ? "Felnőtt (18–64)" : "Adult (18–64)"}
                    </option>
                    <option value="elderly">
                      {isHU ? "Idős (65+)" : "Elderly (65+)"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Aktivitás" : "Activity Level"}
                  </label>
                  <select
                    className="inp"
                    value={activity}
                    onChange={(e) =>
                      setActivity(e.target.value as ActivityLevel)
                    }
                  >
                    <option value="resting">
                      {isHU ? "Pihenő (0.5 m³/hr)" : "Resting (0.5 m³/hr)"}
                    </option>
                    <option value="light">
                      {isHU ? "Könnyű (0.85 m³/hr)" : "Light (0.85 m³/hr)"}
                    </option>
                    <option value="moderate">
                      {isHU ? "Mérsékelt (2.0 m³/hr)" : "Moderate (2.0 m³/hr)"}
                    </option>
                    <option value="heavy">
                      {isHU ? "Intenzív (3.5 m³/hr)" : "Heavy (3.5 m³/hr)"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Meglévő állapot" : "Pre-existing Condition"}
                  </label>
                  <select
                    className="inp"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Condition)}
                  >
                    <option value="none">{isHU ? "Nincs" : "None"}</option>
                    <option value="asthma">
                      {isHU ? "Asztma (×1.6)" : "Asthma (×1.6)"}
                    </option>
                    <option value="copd">
                      {isHU ? "COPD (×1.8)" : "COPD (×1.8)"}
                    </option>
                    <option value="cardiovascular">
                      {isHU ? "Szívbetegség (×1.4)" : "Cardiovascular (×1.4)"}
                    </option>
                    <option value="pregnant">
                      {isHU ? "Terhesség (×1.3)" : "Pregnant (×1.3)"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="inp-label">
                    {isHU ? "Testsúly (kg)" : "Body Weight (kg)"}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    min={3}
                    max={200}
                    value={weight || ""}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <label className="inp-label">
                    {isHU
                      ? "Puha bútorok / szőnyegek?"
                      : "Soft Furnishings / Carpets?"}
                  </label>
                  <select
                    className="inp"
                    value={furn ? "yes" : "no"}
                    onChange={(e) => setFurn(e.target.value === "yes")}
                  >
                    <option value="yes">
                      {isHU
                        ? "Igen (×1.35 harmadkézifüst)"
                        : "Yes (×1.35 thirdhand)"}
                    </option>
                    <option value="no">{isHU ? "Nem" : "No"}</option>
                  </select>
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {isHU ? "Kitettség időtartama" : "Exposure Duration"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--orange)",
                    }}
                  >
                    {years} {isHU ? "év" : "years"}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                />
              </div>
            </div>

            {/* ── RESULTS ── */}
            {result && (
              <>
                {/* Key stats */}
                <div
                  className="grid-3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  {[
                    {
                      icon: "🚬",
                      label: isHU
                        ? "Egyenértékű cig/nap"
                        : "Equiv. Cigarettes/Day",
                      value: result.equivCigs.toFixed(3),
                      color: "var(--orange)",
                      note: "PM₂.₅ basis",
                    },
                    {
                      icon: "📦",
                      label: isHU
                        ? "Élettartam csomag-évek"
                        : "Lifetime Pack-Years",
                      value: result.equivPackYears.toFixed(2),
                      color: "var(--amber)",
                      note: isHU ? "dohányos egyenértékű" : "smoker equivalent",
                    },
                    {
                      icon: "⏱️",
                      label: isHU
                        ? "Biztonságos újrabalépés"
                        : "Safe Re-entry Time",
                      value:
                        result.safeReentryMin > 0
                          ? `${result.safeReentryMin} min`
                          : "✓ Safe",
                      color: result.safeReentryMin > 0 ? "#ef4444" : "#4ade80",
                      note: "WHO PM₂.₅",
                    },
                  ].map(({ icon, label, value, color, note }) => (
                    <div key={label} className="stat-card">
                      <div style={{ fontSize: 22, marginBottom: 12 }}>
                        {icon}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          color: "var(--muted)",
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(22px,3vw,32px)",
                          fontWeight: 800,
                          color,
                          letterSpacing: "-.03em",
                          lineHeight: 1,
                        }}
                      >
                        {value}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--muted)",
                          marginTop: 6,
                          fontFamily: "var(--mono)",
                        }}
                      >
                        {note}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── SHARE CARD CTA ── */}
                <div
                  className="glass"
                  style={{
                    padding: "24px 28px",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: "-.01em",
                        marginBottom: 4,
                      }}
                    >
                      {isHU
                        ? "Osztd meg az eredményeidet"
                        : "Share your exposure results"}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {isHU
                        ? `Kotinin: ${result.biomarker.serumNgMl.toFixed(2)} ng/mL · ${result.biomarker.label.HU}`
                        : `Cotinine: ${result.biomarker.serumNgMl.toFixed(2)} ng/mL · ${result.biomarker.label.EN}`}
                    </p>
                  </div>
                  <button
                    className="share-btn"
                    onClick={() => setShareOpen(true)}
                  >
                    📤 {isHU ? "Kártya létrehozása" : "Create Share Card"}
                  </button>
                </div>

                {/* Cotinine biomarker */}
                <div
                  className="glass"
                  style={{
                    padding: 28,
                    marginBottom: 24,
                    borderLeft: `3px solid ${bioColor}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          color: "var(--muted)",
                          letterSpacing: ".12em",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        🧬{" "}
                        {isHU
                          ? "Becsült Szérum Kotinin · Klinikai Biomarker"
                          : "Estimated Serum Cotinine · Clinical Biomarker"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "clamp(28px,4vw,42px)",
                            fontWeight: 800,
                            letterSpacing: "-.03em",
                          }}
                        >
                          {result.biomarker.serumNgMl.toFixed(3)}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 13,
                            color: "var(--muted)",
                          }}
                        >
                          ng/mL
                        </span>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 100,
                            fontSize: 10,
                            fontFamily: "var(--mono)",
                            fontWeight: 700,
                            background: `${bioColor}22`,
                            color: bioColor,
                          }}
                        >
                          {isHU
                            ? result.biomarker.label.HU
                            : result.biomarker.label.EN}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--muted)",
                          lineHeight: 1.6,
                          maxWidth: 480,
                        }}
                      >
                        {isHU
                          ? result.biomarker.note.HU
                          : result.biomarker.note.EN}
                      </p>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--muted)",
                        lineHeight: 1.8,
                        flexShrink: 0,
                      }}
                    >
                      <div>
                        {"<0.05"} — {isHU ? "Háttér" : "Background"}
                      </div>
                      <div>
                        {"0.05–1.0"} — {isHU ? "Alacsony" : "Low SHS"}
                      </div>
                      <div style={{ color: "var(--orange)" }}>
                        {"1.0–10"} — {isHU ? "Mérsékelt ⚠" : "Moderate ⚠"}
                      </div>
                      <div style={{ color: "#ef4444" }}>
                        {">10"} — {isHU ? "Magas" : "High"}
                      </div>
                      <div style={{ opacity: 0.5, fontSize: 10, marginTop: 4 }}>
                        CDC NHANES
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multi-pollutant table */}
                <div
                  className="glass"
                  style={{ overflow: "hidden", marginBottom: 24 }}
                >
                  <div
                    style={{
                      padding: "20px 28px 16px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: "-.02em",
                      }}
                    >
                      ⚗️{" "}
                      {isHU
                        ? "Többszennyezős Dózis Analízis"
                        : "Multi-Pollutant Dose Analysis"}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        fontFamily: "var(--mono)",
                        marginTop: 4,
                      }}
                    >
                      {isHU
                        ? "Becsült belélegzett dózis per vegyület — napi expozíció"
                        : "Estimated inhaled dose per compound — daily exposure scenario"}
                    </p>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        className="chem-table-header"
                        style={{
                          background: "rgba(255,255,255,.03)",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {[
                          isHU ? "Vegyület" : "Compound",
                          isHU ? "Szimbólum" : "Symbol",
                          isHU ? "Napi dózis" : "Daily Dose",
                          isHU ? "Limit %" : "% of Limit",
                          isHU ? "Hatás" : "Health Effect",
                        ].map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "12px 16px",
                              textAlign: i > 1 ? "center" : "left",
                              fontFamily: "var(--mono)",
                              fontSize: 10,
                              letterSpacing: ".12em",
                              color: "var(--muted)",
                              fontWeight: 500,
                              textTransform: "uppercase",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.pollutants.map((p, i) => (
                        <tr
                          key={p.symbol}
                          className="chem-row"
                          style={{
                            borderBottom:
                              i < result.pollutants.length - 1
                                ? "1px solid var(--border)"
                                : "none",
                          }}
                        >
                          <td
                            style={{
                              padding: "14px 16px",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: p.color,
                                  flexShrink: 0,
                                }}
                              />
                              {p.name}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontFamily: "var(--mono)",
                              fontSize: 12,
                              color: p.color,
                              textAlign: "center",
                            }}
                          >
                            {p.symbol}
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontFamily: "var(--mono)",
                              fontSize: 12,
                              textAlign: "center",
                            }}
                          >
                            {p.doseUg < 0.01
                              ? p.doseUg.toExponential(2)
                              : p.doseUg.toFixed(2)}{" "}
                            μg
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              textAlign: "center",
                            }}
                          >
                            {p.percentOfLimit !== null ? (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <div
                                  style={{
                                    width: 64,
                                    height: 4,
                                    borderRadius: 2,
                                    background: "rgba(255,255,255,.1)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${Math.min(100, p.percentOfLimit)}%`,
                                      background:
                                        p.percentOfLimit > 100
                                          ? "#ef4444"
                                          : p.percentOfLimit > 50
                                            ? "#f97316"
                                            : "#4ade80",
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: 10,
                                    color:
                                      p.percentOfLimit > 100
                                        ? "#ef4444"
                                        : "var(--muted)",
                                  }}
                                >
                                  {p.percentOfLimit.toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: 10,
                                  color: "#ef4444",
                                }}
                              >
                                No safe level
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 11,
                              color: "var(--muted)",
                              lineHeight: 1.5,
                            }}
                          >
                            {p.healthEffect}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Health risks */}
                <div
                  className="glass"
                  style={{ padding: 28, marginBottom: 24 }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: "-.02em",
                      marginBottom: 20,
                    }}
                  >
                    🫀{" "}
                    {isHU
                      ? "Egészségügyi Kockázat Elemzés"
                      : "Health Risk Quantification"}
                  </h3>
                  <div style={{ display: "grid", gap: 16 }}>
                    {result.risks.map((r) => (
                      <div
                        key={r.condition}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: "0 0 200px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>
                            {isHU ? r.conditionHU : r.condition}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--muted)",
                              fontFamily: "var(--mono)",
                              marginTop: 2,
                            }}
                          >
                            {r.affectsGroup} · {r.source}
                          </div>
                        </div>
                        <div style={{ flex: "0 0 80px", textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color:
                                r.rrIncrease > 1.5
                                  ? "#ef4444"
                                  : r.rrIncrease > 1.2
                                    ? "#f97316"
                                    : "#f59e0b",
                            }}
                          >
                            ×{r.rrIncrease.toFixed(2)}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--muted)",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            RR
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: 10,
                                color: "var(--muted)",
                              }}
                            >
                              {isHU ? "Alapkockázat" : "Baseline"}:{" "}
                              {r.baselineRisk}%
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: 10,
                                color: "#ef4444",
                              }}
                            >
                              +{r.absolutePct.toFixed(2)}%
                            </span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: 6,
                              borderRadius: 3,
                              background: "rgba(255,255,255,.08)",
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                height: "100%",
                                width: `${Math.min(100, (r.baselineRisk / 20) * 100)}%`,
                                background: "rgba(255,255,255,.2)",
                                borderRadius: 3,
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: `${Math.min(100, (r.baselineRisk / 20) * 100)}%`,
                                top: 0,
                                height: "100%",
                                width: `${Math.min(100 - (r.baselineRisk / 20) * 100, (r.absolutePct / 20) * 100)}%`,
                                background: "#ef4444",
                                borderRadius: 3,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontFamily: "var(--mono)",
                      marginTop: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    * RR ={" "}
                    {isHU
                      ? "relatív kockázat. Meta-analíziseken alapul. Nem diagnosztikai eszköz."
                      : "relative risk multiplier. Based on published meta-analyses. Not a diagnostic tool."}
                  </p>
                </div>

                {/* PM2.5 + Thirdhand */}
                <div
                  className="grid-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div className="glass" style={{ padding: 24 }}>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        color: "var(--muted)",
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        marginBottom: 12,
                      }}
                    >
                      📊{" "}
                      {isHU ? "Légköri PM₂.₅" : "Ambient PM₂.₅ Concentration"}
                    </div>
                    <div style={{ display: "flex", gap: 24 }}>
                      <div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color:
                              result.peakPm25 > 150
                                ? "#ef4444"
                                : result.peakPm25 > 55
                                  ? "#f97316"
                                  : "#f59e0b",
                            letterSpacing: "-.03em",
                          }}
                        >
                          {result.peakPm25}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          μg/m³ peak
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: "var(--amber)",
                            letterSpacing: "-.03em",
                          }}
                        >
                          {result.avgPm25}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          μg/m³ avg
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--muted)",
                      }}
                    >
                      WHO 24h: 15 μg/m³ ·{" "}
                      {isHU ? "Az Ön szintje" : "Your level"}:{" "}
                      {((result.avgPm25 / 15) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="glass" style={{ padding: 24 }}>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        color: "var(--muted)",
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        marginBottom: 12,
                      }}
                    >
                      🧱{" "}
                      {isHU
                        ? "Harmadkézifüst Terhelés"
                        : "Thirdhand Smoke Load"}
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color:
                          result.thirdhand > 60
                            ? "#ef4444"
                            : result.thirdhand > 30
                              ? "#f97316"
                              : "#f59e0b",
                        letterSpacing: "-.03em",
                        marginBottom: 8,
                      }}
                    >
                      {result.thirdhand}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: "var(--muted)",
                        }}
                      >
                        /100
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${result.thirdhand}%`,
                          background: `linear-gradient(90deg,#f59e0b,${result.thirdhand > 60 ? "#ef4444" : "#f97316"})`,
                          borderRadius: 3,
                          transition: "width .5s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 11,
                        color: "var(--muted)",
                        fontFamily: "var(--mono)",
                        lineHeight: 1.6,
                      }}
                    >
                      {isHU
                        ? "Felületi nikotinkibocsátás dohányzás után."
                        : "Surface nicotine re-emission after smoking."}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── CHART ── */}
        <section style={{ padding: "0 24px 100px" }}>
          <div className="container">
            <div className="glass" style={{ padding: "36px" }}>
              <div style={{ marginBottom: 28 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    marginBottom: 6,
                  }}
                >
                  {isHU
                    ? "Kumulatív Kitettség az Idő Függvényében"
                    : "Cumulative Exposure Over Time"}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    color: "var(--muted)",
                  }}
                >
                  {isHU
                    ? `${years} éves periódus · PM₂.₅ alapú egyenértékű cigaretták`
                    : `${years}-year period · PM₂.₅-based equivalent cigarettes`}
                </p>
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="gradOrange"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ff5c1a"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ff5c1a"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="year"
                      stroke="rgba(255,255,255,.15)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="var(--mono)"
                    />
                    <YAxis
                      stroke="rgba(255,255,255,.15)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="var(--mono)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111118",
                        border: "1px solid rgba(255,92,26,.3)",
                        borderRadius: 12,
                        fontFamily: "var(--mono)",
                        fontSize: 12,
                      }}
                      itemStyle={{ color: "var(--orange)" }}
                      labelStyle={{ color: "var(--muted)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cigs"
                      stroke="#ff5c1a"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#gradOrange)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ── HEALTH TIMELINE ── */}
        {result && result.timeline.length > 0 && (
          <section style={{ padding: "0 24px 100px" }}>
            <div className="container">
              <div style={{ marginBottom: 32, textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "clamp(22px,3vw,36px)",
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                  }}
                >
                  🗓 {isHU ? "Egészségügyi Idővonal" : "Health Timeline"}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    marginTop: 8,
                    fontFamily: "var(--mono)",
                  }}
                >
                  {isHU
                    ? `${years} éves kitettség · [SG06] + [IARC]`
                    : `Based on ${years} years of exposure · [SG06] + [IARC]`}
                </p>
              </div>
              <div
                className="grid-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 12,
                }}
              >
                {result.timeline.map((item, i) => (
                  <div
                    key={i}
                    className="glass"
                    style={{
                      padding: "20px 24px",
                      borderLeft: `3px solid ${item.color}`,
                      borderRadius: "0 16px 16px 0",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: item.color,
                        letterSpacing: ".1em",
                        marginBottom: 6,
                      }}
                    >
                      {isHU ? `${item.year}. év` : `Year ${item.year}`}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--white)",
                        lineHeight: 1.6,
                      }}
                    >
                      {isHU ? item.event.HU : item.event.EN}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CHEMICALS ── */}
        <section id="chemicals" style={{ padding: "0 24px 100px" }}>
          <div className="container">
            <div style={{ marginBottom: 48, textAlign: "center" }}>
              <div className="badge" style={{ marginBottom: 20 }}>
                ⚗️ {isHU ? "Toxikológia" : "Toxicology"}
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px,4vw,48px)",
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                }}
              >
                {isHU ? "A kémiai terhelés" : "The Chemical Payload"}
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 14,
                  marginTop: 10,
                  fontFamily: "var(--mono)",
                }}
              >
                {isHU
                  ? "Oldalsugár füstben (magasabb koncentrációban jelenlévő vegyületek)"
                  : "Found in sidestream smoke at higher concentrations"}
              </p>
            </div>
            <div className="glass" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    className="chem-table-header"
                    style={{
                      background: "rgba(255,255,255,.03)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {[
                      "Chemical",
                      isHU ? "Ipari felhasználás" : "Industrial Use",
                      isHU ? "Toxicitás" : "Toxicity",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "16px 20px",
                          textAlign:
                            i === 2 ? "center" : i === 3 ? "right" : "left",
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          letterSpacing: ".15em",
                          color: "var(--muted)",
                          fontWeight: 500,
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CHEMICALS).map(([name, data], i) => (
                    <tr
                      key={name}
                      className="chem-row"
                      style={{
                        borderBottom:
                          i < 4 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "20px",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background:
                                TOXICITY_COLORS[
                                  data.level as keyof typeof TOXICITY_COLORS
                                ],
                              ...(name === "Polonium-210"
                                ? { animation: "radioactive 1s infinite" }
                                : {}),
                            }}
                          />
                          {name}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "20px",
                          fontFamily: "var(--mono)",
                          fontSize: 12,
                          color: "var(--muted)",
                        }}
                      >
                        {isHU ? data.use.HU : data.use.EN}
                      </td>
                      <td style={{ padding: "20px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "var(--mono)",
                            background: `${TOXICITY_COLORS[data.level as keyof typeof TOXICITY_COLORS]}20`,
                            color:
                              TOXICITY_COLORS[
                                data.level as keyof typeof TOXICITY_COLORS
                              ],
                            border: `1px solid ${TOXICITY_COLORS[data.level as keyof typeof TOXICITY_COLORS]}40`,
                          }}
                        >
                          {isHU ? data.toxicity.HU : data.toxicity.EN}
                        </span>
                      </td>
                      <td style={{ padding: "20px", textAlign: "right" }}>
                        <button
                          onClick={() => {
                            setSelectedChem(name);
                            setModalOpen(true);
                          }}
                          style={{
                            background: "rgba(255,255,255,.05)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "6px 14px",
                            color: "var(--white)",
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: "var(--mono)",
                          }}
                          onMouseOver={(e) =>
                            ((e.target as HTMLElement).style.background =
                              "rgba(255,92,26,.15)")
                          }
                          onMouseOut={(e) =>
                            ((e.target as HTMLElement).style.background =
                              "rgba(255,255,255,.05)")
                          }
                        >
                          {isHU ? "részletek →" : "details →"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: "0 24px 100px" }}>
          <div className="container">
            <h2
              style={{
                fontSize: "clamp(28px,4vw,48px)",
                fontWeight: 800,
                letterSpacing: "-.03em",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              {isHU ? "Gyakori kérdések" : "FAQ"}
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              {(isHU
                ? [
                    {
                      q: "Valóban veszélyes a passzív dohányzás?",
                      a: "Igen. Nincs biztonságos kitettségi szint. Több ezer vegyi anyagot tartalmaz, melyek közül sok mérgező vagy rákkeltő. A passzív dohányzás növeli a tüdőrák, szívbetegség és légzőszervi problémák kockázatát minden korosztályban.",
                    },
                    {
                      q: "Eltávolítható-e a füst légtisztítóval?",
                      a: "A légtisztítók csökkenthetik néhány részecskét, de nem távolítják el az összes toxint vagy gázt a dohányfüstből. A teljes védelemhez csak a füstmentes környezet biztosít megoldást.",
                    },
                    {
                      q: "Hogyan védhetem meg a családomat?",
                      a: "Tedd füstmentessé otthonod és autód, bátorítsd a dohányzókat a leszokásra, és kerüld a dohányzó helyeket. A gyermekek és idősek különösen érzékenyek a passzív dohányzásra.",
                    },
                  ]
                : [
                    {
                      q: "Is secondhand smoke really dangerous?",
                      a: "Yes. There is no safe level of exposure. It contains thousands of chemicals, many of which are toxic or carcinogenic. Secondhand smoke increases the risk of lung cancer, heart disease, and respiratory problems for all ages.",
                    },
                    {
                      q: "Can air purifiers eliminate secondhand smoke?",
                      a: "Air purifiers may reduce some particles, but cannot remove all toxins or gases. Only a smoke-free environment provides full protection.",
                    },
                    {
                      q: "What are the best ways to protect my family?",
                      a: "Make your home and car smoke-free, encourage smokers to quit, and avoid places where smoking occurs. Children and the elderly are especially vulnerable to secondhand smoke.",
                    },
                  ]
              ).map(({ q, a }, i) => (
                <div key={i} className="glass" style={{ padding: "24px 28px" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: 10,
                      letterSpacing: "-.01em",
                    }}
                  >
                    {q}
                  </div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    {a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ACTION + METHODOLOGY ── */}
        <section style={{ padding: "0 24px 100px" }}>
          <div className="container">
            <div
              className="grid-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg,rgba(255,92,26,.15) 0%,rgba(255,92,26,.04) 100%)",
                  border: "1px solid rgba(255,92,26,.25)",
                  borderRadius: 24,
                  padding: 36,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>🚭</div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                    marginBottom: 20,
                  }}
                >
                  {isHU ? "Tegyél lépéseket" : "Take Action"}
                </h3>
                {[
                  {
                    href: "https://smokefree.gov/",
                    label: isHU
                      ? "Smokefree.gov — Ingyenes eszközök"
                      : "Smokefree.gov — Free quit resources",
                  },
                  {
                    href: "https://www.lung.org/quit-smoking",
                    label: "American Lung Association",
                  },
                  {
                    href: "https://www.tobaccofreekids.org/",
                    label: "Campaign for Tobacco-Free Kids",
                  },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                      color: "var(--white)",
                      textDecoration: "none",
                      fontSize: 14,
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = "var(--orange)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = "var(--white)")
                    }
                  >
                    <span style={{ color: "var(--orange)" }}>→</span> {label}
                  </a>
                ))}
              </div>
              <div className="glass" style={{ padding: 36 }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🔬</div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                    marginBottom: 16,
                  }}
                >
                  {isHU ? "Tudományos Módszertan" : "Scientific Methodology"}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  {isHU
                    ? "A motor a Repace & Lowrey 1980 tömegmérleg-modellt, az EPA CONTAM-ot és a WHO 2010 irányelveit kombinálja. 8 szennyezőanyagot modellezünk egyenként, személyre szabott expozícióval."
                    : "The engine combines the Repace & Lowrey 1980 mass-balance model, EPA CONTAM, and WHO 2010 guidelines. 8 pollutants modelled individually with person-specific breathing rates and condition multipliers."}
                </p>
                {[
                  {
                    code: "[SRC 01]",
                    text: "U.S. Surgeon General Report, 2006",
                  },
                  {
                    code: "[SRC 02]",
                    text: "IARC Monograph Vol. 83: Tobacco Smoke",
                  },
                  {
                    code: "[SRC 03]",
                    text: "Repace & Lowrey 1980 — Indoor SHS Model",
                  },
                  {
                    code: "[SRC 04]",
                    text: "WHO Indoor Air Quality Guidelines, 2010",
                  },
                ].map(({ code, text }) => (
                  <div
                    key={code}
                    style={{
                      background: "rgba(0,0,0,.4)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      marginBottom: 8,
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: "var(--orange)", marginRight: 8 }}>
                      {code}
                    </span>
                    <span style={{ color: "var(--muted)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,var(--orange),#ff9f50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                💨
              </div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>
                <span style={{ color: "var(--white)" }}>invisible</span>
                <span style={{ color: "var(--orange)" }}>inhale</span>
              </span>
            </div>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 12,
                fontFamily: "var(--mono)",
                maxWidth: 500,
                margin: "0 auto 16px",
                lineHeight: 1.7,
              }}
            >
              {isHU
                ? "Ez az eszköz oktatási célokat szolgál. Személyre szabott egészségügyi tanácsért fordulj orvoshoz."
                : "This tool is for educational purposes. Consult a medical professional for personalized health assessment."}
            </p>
            <p
              className="footer-copyright"
              style={{
                color: "rgba(255,255,255,.15)",
                fontSize: 11,
                fontFamily: "var(--mono)",
              }}
            >
              © {new Date().getFullYear()} Invisible Inhale — Educational
              Platform
            </p>
          </div>
        </footer>

        {/* ── CHEMICAL MODAL ── */}
        {modalOpen &&
          selectedChem &&
          (() => {
            if (!Object.keys(CHEMICALS).includes(selectedChem)) return null;
            const chemKey = selectedChem as ChemicalName;
            const chemData = CHEMICALS[chemKey];
            const color = TOXICITY_COLORS[chemData.level];
            return (
              <div
                className="modal-overlay"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setModalOpen(false);
                }}
              >
                <div className="modal-box">
                  <button
                    className="modal-close-btn"
                    onClick={() => setModalOpen(false)}
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "rgba(255,255,255,.07)",
                      border: "none",
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      cursor: "pointer",
                      color: "var(--white)",
                      fontSize: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: color,
                        ...(chemKey === "Polonium-210"
                          ? { animation: "radioactive 1s infinite" }
                          : {}),
                      }}
                    />
                    <h2
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        letterSpacing: "-.02em",
                      }}
                    >
                      {chemKey}
                    </h2>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 100,
                        fontSize: 10,
                        fontFamily: "var(--mono)",
                        fontWeight: 700,
                        background: `${color}20`,
                        color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {isHU ? chemData.toxicity.HU : chemData.toxicity.EN}
                    </span>
                  </div>
                  {[
                    {
                      icon: "🫁",
                      label: isHU ? "Egészségügyi hatások" : "Health Effects",
                      val: chemData.healthEffects,
                    },
                    {
                      icon: "🛡️",
                      label: isHU ? "Megelőzés" : "Prevention",
                      val: chemData.prevention,
                    },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          color: "var(--muted)",
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        {icon} {label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "var(--white)",
                          lineHeight: 1.7,
                        }}
                      >
                        {isHU ? val.HU : val.EN}
                      </div>
                    </div>
                  ))}
                  <a
                    href={chemData.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 18px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid var(--border)",
                      color: "var(--orange)",
                      textDecoration: "none",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                    }}
                  >
                    → {isHU ? chemData.source.HU : chemData.source.EN}
                  </a>
                </div>
              </div>
            );
          })()}

        {/* ── SHARE MODAL ── */}
        {shareOpen && result && (
          <ShareModal
            result={result}
            years={years}
            cigsPerDay={cigsPerDay}
            isHU={isHU}
            onClose={() => setShareOpen(false)}
          />
        )}
      </div>
    </>
  );
}
