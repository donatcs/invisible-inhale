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

// ─── Google Fonts ───────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --black:   #06060a;
      --surface: #0e0e14;
      --card:    rgba(255,255,255,0.035);
      --border:  rgba(255,255,255,0.08);
      --orange:  #ff5c1a;
      --amber:   #ffb347;
      --white:   #f5f3ee;
      --muted:   rgba(245,243,238,0.45);
      --mono:    'DM Mono', monospace;
      --sans:    'Syne', sans-serif;
      --serif:   'Instrument Serif', serif;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--black);
      color: var(--white);
      font-family: var(--sans);
      -webkit-font-smoothing: antialiased;
    }

    /* ── Animations ─────────────────────────── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes smokeFloat {
      0%,100% { transform: translateY(0) scale(1);   opacity: .07; }
      50%      { transform: translateY(-40px) scale(1.08); opacity: .12; }
    }
    @keyframes gridPulse {
      0%,100% { opacity: .4; }
      50%      { opacity: .7; }
    }
    @keyframes orb1 {
      0%,100% { transform: translate(0,0) scale(1); }
      33%      { transform: translate(60px,-40px) scale(1.1); }
      66%      { transform: translate(-30px,50px) scale(.95); }
    }
    @keyframes orb2 {
      0%,100% { transform: translate(0,0) scale(1); }
      33%      { transform: translate(-70px,60px) scale(1.05); }
      66%      { transform: translate(50px,-30px) scale(.9); }
    }
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes pulseDot {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,92,26,.5); }
      50%      { box-shadow: 0 0 0 8px rgba(255,92,26,0); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes radioactive {
      0%,100% { opacity:1; } 50% { opacity:.4; }
    }
    @keyframes slideIn {
      from { opacity:0; transform:scale(.96) translateY(16px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }

    .fade-up { animation: fadeUp .7s ease both; }
    .delay-1 { animation-delay: .1s; }
    .delay-2 { animation-delay: .2s; }
    .delay-3 { animation-delay: .3s; }
    .delay-4 { animation-delay: .4s; }
    .delay-5 { animation-delay: .5s; }
    .delay-6 { animation-delay: .6s; }
    .delay-8 { animation-delay: .8s; }
    .delay-10{ animation-delay:1.0s; }

    /* ── Layout ─────────────────────────────── */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

    /* ── Glass card ─────────────────────────── */
    .glass {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      backdrop-filter: blur(12px);
    }

    /* ── Badge ──────────────────────────────── */
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,92,26,.12);
      border: 1px solid rgba(255,92,26,.3);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 11px; font-weight: 600; letter-spacing: .12em;
      color: var(--orange); text-transform: uppercase;
    }
    .badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--orange);
      animation: pulseDot 2s infinite;
    }

    /* ── Inputs ─────────────────────────────── */
    .inp {
      width: 100%; padding: 12px 16px;
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--white); font-family: var(--mono); font-size: 14px;
      outline: none; transition: border-color .2s, background .2s;
    }
    .inp:focus { border-color: var(--orange); background: rgba(255,92,26,.06); }
    .inp-label {
      display: block; font-size: 11px; font-weight: 500;
      letter-spacing: .1em; text-transform: uppercase;
      color: var(--muted); margin-bottom: 8px;
    }

    /* ── Stat card ──────────────────────────── */
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px;
      position: relative; overflow: hidden;
      transition: border-color .3s, transform .3s;
      cursor: default;
    }
    .stat-card:hover { border-color: rgba(255,92,26,.35); transform: translateY(-3px); }
    .stat-card::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(60% 60% at 50% 0%, rgba(255,92,26,.08) 0%, transparent 100%);
      opacity: 0; transition: opacity .3s;
    }
    .stat-card:hover::before { opacity: 1; }

    /* ── Chemical table ─────────────────────── */
    .chem-row { transition: background .2s; }
    .chem-row:hover { background: rgba(255,255,255,.03); }

    /* ── Ticker ─────────────────────────────── */
    .ticker-wrap {
      overflow: hidden; white-space: nowrap;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 14px 0;
    }
    .ticker-inner {
      display: inline-block;
      animation: ticker 28s linear infinite;
    }

    /* ── Locale toggle ──────────────────────── */
    .locale-btn {
      padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
      border: 1px solid transparent; cursor: pointer; transition: all .2s;
      font-family: var(--sans);
    }

    /* ── Hero range ─────────────────────────── */
    input[type=range] {
      -webkit-appearance: none; width: 100%; height: 4px;
      border-radius: 4px; outline: none; cursor: pointer;
      background: rgba(255,255,255,.1);
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--orange);
      border: 3px solid var(--black);
      box-shadow: 0 0 0 2px var(--orange);
    }

    /* ── Modal ──────────────────────────────── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,.75);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .modal-box {
      background: #13131a;
      border: 1px solid rgba(255,92,26,.3);
      border-radius: 24px; padding: 36px;
      max-width: 480px; width: 100%;
      animation: slideIn .3s ease;
      position: relative;
    }

    /* ── Scrollbar ──────────────────────────── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--black); }
    ::-webkit-scrollbar-thumb { background: rgba(255,92,26,.4); border-radius: 3px; }

    /* ── Responsive ─────────────────────────── */
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .stats-strip { grid-template-columns: repeat(3, 1fr); }
    .hero-btns { flex-direction: row; }
    .chem-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .chem-use-col { display: table-cell; }
    .nav-logo-text { display: inline; }

    @media (max-width: 768px) {
      .grid-3 { grid-template-columns: 1fr !important; }
      .grid-2 { grid-template-columns: 1fr !important; }
      .stats-strip { grid-template-columns: 1fr !important; }
      .hero-btns { flex-direction: column !important; align-items: stretch !important; }
      .hero-btns a { text-align: center !important; justify-content: center !important; }
      .chem-use-col { display: none !important; }
      .section-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .calc-glass { padding: 20px !important; }
      .modal-box { padding: 24px !important; margin: 16px !important; }
      .timeline-grid { grid-template-columns: 1fr !important; }
      .action-grid { grid-template-columns: 1fr !important; }
      .stat-card { padding: 20px !important; }
      .nav-inner { padding: 0 16px !important; }
    }

    @media (max-width: 480px) {
      .stats-strip > div { padding: 20px 12px !important; }
      .stats-strip > div > div:first-child { font-size: 28px !important; }
    }
  `}</style>
);

// ─── Chemical details data ────────────────────────────────────────────────────
type ChemicalName = keyof typeof CHEMICALS_RAW;
type ChemicalData = {
  use: string;
  toxicity: string;
  level: 1 | 2 | 3 | 4 | 5;
  healthEffects: string;
  source: string;
  sourceUrl: string;
  prevention: string;
};

const CHEMICALS_RAW = {
  Formaldehyde: {
    use: "Embalming fluid",
    toxicity: "Carcinogen",
    level: 2,
    healthEffects: "Eye, nose, and throat irritation; increased cancer risk.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/formaldehyde/",
    prevention: "Avoid exposure, ventilate spaces, use air purifiers.",
  },
  Benzene: {
    use: "Gasoline additive",
    toxicity: "High",
    level: 3,
    healthEffects: "Blood disorders, leukemia, immune system damage.",
    source: "CDC/NIOSH",
    sourceUrl: "https://www.cdc.gov/niosh/topics/benzene/",
    prevention: "Avoid smoke, use protective equipment in workplaces.",
  },
  Arsenic: {
    use: "Rat poison",
    toxicity: "Lethal",
    level: 4,
    healthEffects: "Skin lesions, cancer, cardiovascular disease.",
    source: "WHO",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/arsenic",
    prevention: "Avoid contaminated sources, ensure clean water.",
  },
  Ammonia: {
    use: "Toilet cleaner",
    toxicity: "Irritant",
    level: 1,
    healthEffects: "Respiratory irritation, coughing, asthma aggravation.",
    source: "CDC/NIOSH",
    sourceUrl: "https://www.cdc.gov/niosh/topics/ammonia/",
    prevention: "Ventilate, avoid mixing with bleach, minimize exposure.",
  },
  "Polonium-210": {
    use: "Radioactive element",
    toxicity: "Radioactive",
    level: 5,
    healthEffects: "Radiation poisoning, lung cancer risk.",
    source: "American Cancer Society",
    sourceUrl:
      "https://www.cancer.org/cancer/risk-prevention/tobacco/secondhand-smoke.html",
    prevention: "Avoid tobacco smoke, support smoke-free policies.",
  },
} as const;

const CHEMICALS: Record<ChemicalName, ChemicalData> = CHEMICALS_RAW;

const TOXICITY_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "#94a3b8",
  2: "#f59e0b",
  3: "#f97316",
  4: "#ef4444",
  5: "#ff2d55",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function SmokeTracker() {
  const [locale, setLocale] = useState("HU");
  const [years, setYears] = useState(25);
  const [cigsPerDay, setCigsPerDay] = useState(1.5);
  const [smokers, setSmokers] = useState(1);
  const [envSize, setEnvSize] = useState(1000);
  const [roomClean, setRoomClean] = useState(true);
  const [stats, setStats] = useState({ totalCigs: 0, chemicals: 0, money: 0 });
  const [selectedChem, setSelectedChem] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const heroRef = useRef(null);

  const costPerCig = locale === "US" ? 0.5 : 120;

  const isHU = locale === "HU";
  const currencySymbol = isHU ? "" : "$";
  const currencySuffix = isHU ? " Ft" : "";

  useEffect(() => {
    let ef = 1;
    if (!roomClean) ef += 0.5;
    ef += (smokers - 1) * 0.7;
    ef *= Math.max(0.5, 1000 / envSize);
    const total = years * 365 * cigsPerDay * ef;
    const baseline = years * 365 * cigsPerDay;
    setStats({
      totalCigs: Math.round(total),
      chemicals: Math.round(total * 7000),
      money: Math.round(baseline * costPerCig),
    });
  }, [years, cigsPerDay, smokers, envSize, roomClean, costPerCig]);

  const chartData = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    cigs: Math.round((i + 1) * 365 * cigsPerDay),
  }));

  const openModal = (chem: string) => {
    setSelectedChem(chem);
    setModalOpen(true);
  };

  const t = {
    hero1: "The Invisible",
    hero2: "Inhale",
    heroSub: isHU
      ? "Minden légvételeddel vegyi anyagok ezreit szívod be. Vizualizáljuk a passzív dohányzás valódi hatásait."
      : "With every breath, thousands of chemicals enter your lungs uninvited. We visualize the true cost of secondhand smoke.",
    cta: isHU ? "Töltsd ki a kvízt" : "Take the Assessment",
    calcTitle: isHU ? "Kockázat Kalkulátor" : "Risk Calculator",
    yearsLabel: isHU ? "Kitettség évei" : "Years Exposed",
    cigsLabel: isHU ? "Cigaretta/nap (passzív)" : "Cigarettes/Day (passive)",
    smokersLabel: isHU ? "Dohányzók a háztartásban" : "Household Smokers",
    sizeLabel: isHU ? "Lakás mérete (m²/ft²)" : "Home Size (sq ft)",
    roomLabel: isHU ? "Füstmentes szoba?" : "Smoke-free Room?",
    stat1: isHU ? "Összes passzív cigaretta" : "Passive Cigarettes",
    stat2: isHU ? "Vegyi anyag terhelés" : "Chemical Exposure",
    stat3: isHU ? "Elpazarolt pénz" : "Money Wasted",
    chartTitle: isHU ? "Kumulatív Kitettség" : "Cumulative Exposure Over Time",
    chemTitle: isHU ? "A Kémiai Rakománya" : "The Chemical Payload",
    chemSub: isHU
      ? "Oldalsugár füstben (magasabb koncentráció)"
      : "Found in sidestream smoke at higher concentrations",
    faqTitle: isHU ? "GYIK" : "FAQ",
    actionTitle: isHU ? "Tegyél Lépéseket" : "Take Action",
    disclaimer: isHU
      ? "Ez az eszköz oktatási célokat szolgál. Személyre szabott értékeléshez fordulj orvoshoz."
      : "This tool is for educational purposes. Consult a medical professional for personalized health assessment.",
  };

  return (
    <>
      <FontLink />

      <div
        style={{
          background: "var(--black)",
          minHeight: "100vh",
          fontFamily: "var(--sans)",
          overflow: "hidden",
        }}
      >
        {/* ── NAV ─────────────────────────────────────────────────── */}
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
                }}
              >
                invisible<span style={{ color: "var(--orange)" }}>inhale</span>
              </span>
            </div>
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
                    background: locale === l ? "var(--orange)" : "transparent",
                    color: locale === l ? "#fff" : "var(--muted)",
                    border: "none",
                  }}
                >
                  {l === "US" ? "🇺🇸 EN" : "🇭🇺 HU"}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
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
          {/* Animated background orbs */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            {/* Grid pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)
              `,
                backgroundSize: "60px 60px",
                animation: "gridPulse 4s ease-in-out infinite",
              }}
            />
            {/* Smoke orbs */}
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: "10%",
                width: 600,
                height: 600,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,92,26,.15) 0%, transparent 70%)",
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
                  "radial-gradient(circle, rgba(255,92,26,.1) 0%, transparent 70%)",
                animation: "orb2 22s ease-in-out infinite",
                filter: "blur(50px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 800,
                height: 800,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,179,71,.04) 0%, transparent 60%)",
                filter: "blur(80px)",
              }}
            />
            {/* Vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center, transparent 30%, var(--black) 100%)",
              }}
            />
          </div>

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "100%",
              width: "820px",
              margin: "0 auto",
            }}
          >
            <div className="fade-up" style={{ marginBottom: 28 }}>
              <span className="badge">
                <span className="badge-dot" />
                {isHU
                  ? "Oktatási Platform • Tudományos Adatok"
                  : "Educational Platform • Science-Backed Data"}
              </span>
            </div>

            <h1
              className="hero-title fade-up delay-1"
              style={{
                fontSize: "clamp(36px, 9vw, 110px)",
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: "-.04em",
                marginBottom: 28,
              }}
            >
              {t.hero1}{" "}
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  background:
                    "linear-gradient(135deg, var(--orange) 0%, var(--amber) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.hero2}
              </span>
            </h1>
            <p
              className="fade-up delay-2"
              style={{
                fontSize: "clamp(16px, 4vw, 20px)",
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "95vw",
                margin: "0 auto 48px",
              }}
            >
              {t.heroSub}
            </p>
            <div
              className="hero-btns fade-up delay-3"
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href="/quiz"
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
                  transition: "transform .2s, box-shadow .2s",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign("/quiz");
                }}
              >
                {t.cta} →
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
                  transition: "border-color .2s",
                }}
              >
                {isHU ? "Vegyi anyagok" : "See Chemicals"}
              </a>
            </div>
            {/* Floating stats strip */}
            <div
              className="stats-strip fade-up delay-5"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                marginTop: 80,
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

        {/* ── CALCULATOR ──────────────────────────────────────────── */}
        <section
          id="calculator"
          className="section-pad"
          style={{ padding: "100px 5vw", position: "relative" }}
        >
          <div className="container">
            <div style={{ marginBottom: 56, textAlign: "center" }}>
              <div className="badge" style={{ marginBottom: 20 }}>
                <span className="badge-dot" />
                {isHU ? "Interaktív Eszköz" : "Interactive Tool"}
              </div>
              <h2
                style={{
                  fontSize: "clamp(32px, 5vw, 56px)",
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                {t.calcTitle}
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 16,
                  maxWidth: 500,
                  margin: "0 auto",
                }}
              >
                {isHU
                  ? "Állítsd be a paramétereket és nézd meg valós időben a kitettségedet."
                  : "Adjust the parameters and see your personalized exposure in real time."}
              </p>
            </div>

            {/* Source note */}
            <div
              style={{
                background: "rgba(255,179,71,.06)",
                border: "1px solid rgba(255,179,71,.2)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 36,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "rgba(255,179,71,.8)",
                lineHeight: 1.6,
              }}
            >
              {isHU
                ? "Modell: napi 1,5 passzív cigaretta (2006 Surgeon General Report & IARC Monograph Vol. 83). Egy cigaretta >7 000 vegyi anyagot tartalmaz. 1 db. cigaretta ára: ~120 Ft (Magyarországon)."
                : "Model: 1.5 cigarettes/day passive exposure (2006 Surgeon General Report & IARC Monograph Vol. 83). Each cigarette contains 7,000+ chemicals. Cost per cigarette: ~$0.50 (in the US)."}
            </div>

            {/* Controls grid */}
            <div
              className="glass calc-glass"
              style={{ padding: "36px", marginBottom: 24 }}
            >
              <div
                className="grid-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 20,
                  marginBottom: 28,
                }}
              >
                {[
                  {
                    label: t.yearsLabel,
                    id: "years",
                    value: years,
                    set: setYears,
                    min: 1,
                    max: 50,
                    step: 1,
                  },
                  {
                    label: t.cigsLabel,
                    id: "cigs",
                    value: cigsPerDay,
                    set: setCigsPerDay,
                    min: 0.1,
                    max: 10,
                    step: 0.1,
                  },
                  {
                    label: t.smokersLabel,
                    id: "smokers",
                    value: smokers,
                    set: setSmokers,
                    min: 1,
                    max: 10,
                    step: 1,
                  },
                  {
                    label: t.sizeLabel,
                    id: "size",
                    value: envSize,
                    set: setEnvSize,
                    min: 100,
                    max: 5000,
                    step: 50,
                  },
                ].map(({ label, id, value, set, min, max, step }) => (
                  <div key={id}>
                    <label htmlFor={id} className="inp-label">
                      {label}
                    </label>
                    <input
                      id={id}
                      type="number"
                      className="inp"
                      min={min}
                      max={max}
                      step={step}
                      value={value}
                      onChange={(e) => set(Number(e.target.value))}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="room" className="inp-label">
                    {t.roomLabel}
                  </label>
                  <select
                    id="room"
                    className="inp"
                    value={roomClean ? "yes" : "no"}
                    onChange={(e) => setRoomClean(e.target.value === "yes")}
                  >
                    <option value="yes">{isHU ? "Igen ✓" : "Yes ✓"}</option>
                    <option value="no">{isHU ? "Nem ✗" : "No ✗"}</option>
                  </select>
                </div>
              </div>

              {/* Year slider */}
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
                    {isHU ? "Kitettség" : "Exposure"}
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

            {/* Stat cards */}
            <div
              className="grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {[
                {
                  label: t.stat1,
                  value: stats.totalCigs.toLocaleString(),
                  color: "var(--orange)",
                  icon: "🚬",
                  tooltip: isHU
                    ? "Évek × 365 × cig/nap × kitettségi faktor"
                    : "Years × 365 × cig/day × exposure factor",
                },
                {
                  label: t.stat2,
                  value: stats.chemicals.toLocaleString(),
                  color: "var(--amber)",
                  icon: "⚗️",
                  tooltip: isHU
                    ? "Összes cigaretta × 7 000"
                    : "Total cigarettes × 7,000 chemicals",
                },
                {
                  label: t.stat3,
                  value: `${currencySymbol}${stats.money.toLocaleString()}${currencySuffix}`,
                  color: "#4ade80",
                  icon: "💸",
                  tooltip: isHU
                    ? "Alapvonal cig × ár. Nem függ a mérettől."
                    : "Baseline cigs × cost. Not affected by environment size.",
                },
              ].map(({ label, value, color, icon, tooltip }) => (
                <div key={label} className="stat-card" title={tooltip}>
                  <div style={{ fontSize: 24, marginBottom: 14 }}>{icon}</div>
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
                      fontSize: "clamp(24px, 3vw, 36px)",
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
                      color: "rgba(255,255,255,.2)",
                      marginTop: 8,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {isHU
                      ? "Hover a számítás részleteiért"
                      : "Hover for calculation details"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHART ───────────────────────────────────────────────── */}
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
                  {t.chartTitle}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    color: "var(--muted)",
                  }}
                >
                  {isHU
                    ? `${years} éves periódus • Összes bevett cigaretta`
                    : `${years}-year period • Cumulative passive cigarettes inhaled`}
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
                          stopOpacity={0.0}
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

        {/* ── HEALTH TIMELINE ─────────────────────────────────────── */}
        <section style={{ padding: "0 24px 100px" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
              className="grid-2"
            >
              {[
                {
                  year: isHU ? "1. év" : "Year 1",
                  text: isHU
                    ? "Növekvő légúti fertőzés kockázat, szemirritáció"
                    : "Increased respiratory infections, eye irritation",
                  color: "#f59e0b",
                },
                {
                  year: isHU ? "5. év" : "Year 5",
                  text: isHU
                    ? "Krónikus köhögés, asztma tünetek erősödése"
                    : "Chronic cough, worsening asthma symptoms",
                  color: "#f97316",
                },
                {
                  year: isHU ? "10. év" : "Year 10",
                  text: isHU
                    ? "Emelkedett szívbetegség és stroke kockázat"
                    : "Elevated risk of heart disease and stroke",
                  color: "#ef4444",
                },
                {
                  year: isHU ? "20+ év" : "Year 20+",
                  text: isHU
                    ? "Magasabb tüdőrák kockázat, tartós tüdőkárosodás"
                    : "Higher lung cancer risk, permanent lung damage",
                  color: "#ff2d55",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass"
                  style={{
                    padding: "24px",
                    borderLeft: `3px solid ${item.color}`,
                    borderRadius: "0 16px 16px 0",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: item.color,
                      letterSpacing: ".1em",
                      marginBottom: 8,
                    }}
                  >
                    {item.year}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--white)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHEMICALS ───────────────────────────────────────────── */}
        <section id="chemicals" style={{ padding: "0 24px 100px" }}>
          <div className="container">
            <div style={{ marginBottom: 48, textAlign: "center" }}>
              <div className="badge" style={{ marginBottom: 20 }}>
                ⚗️ {isHU ? "Toxikológia" : "Toxicology"}
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                }}
              >
                {t.chemTitle}
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 14,
                  marginTop: 10,
                  fontFamily: "var(--mono)",
                }}
              >
                {t.chemSub}
              </p>
            </div>

            <div className="glass" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
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
                        {data.use}
                      </td>
                      <td style={{ padding: "20px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "var(--mono)",
                            letterSpacing: ".05em",
                            background: `${TOXICITY_COLORS[data.level as keyof typeof TOXICITY_COLORS]}20`,
                            color:
                              TOXICITY_COLORS[
                                data.level as keyof typeof TOXICITY_COLORS
                              ],
                            border: `1px solid ${TOXICITY_COLORS[data.level as keyof typeof TOXICITY_COLORS]}40`,
                          }}
                        >
                          {data.toxicity}
                        </span>
                      </td>
                      <td style={{ padding: "20px", textAlign: "right" }}>
                        <button
                          onClick={() => openModal(name)}
                          style={{
                            background: "rgba(255,255,255,.05)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "6px 14px",
                            color: "var(--white)",
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: "var(--mono)",
                            transition: "background .2s",
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

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <section style={{ padding: "0 24px 100px" }}>
          <div className="container">
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-.03em",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              {t.faqTitle}
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              {(isHU
                ? [
                    {
                      q: "Valóban veszélyes a passzív dohányzás?",
                      a: "Igen. Nincs biztonságos kitettségi szint. Több ezer vegyi anyagot tartalmaz, melyek közül sok mérgező vagy rákkeltő.",
                    },
                    {
                      q: "Eltávolítható-e a füst légtisztítóval?",
                      a: "A légtisztítók csökkenthetik néhány részecskét, de nem távolítják el az összes toxint vagy gázt a dohányfüstből.",
                    },
                    {
                      q: "Hogyan védhetem meg a családomat?",
                      a: "Tedd füstmentessé otthonod és autód, bátorítsd a dohányzókat a leszokásra, és kerüld a dohányzó helyeket.",
                    },
                  ]
                : [
                    {
                      q: "Is secondhand smoke really dangerous?",
                      a: "Yes. There is no safe level of exposure. It contains thousands of chemicals, many of which are toxic or carcinogenic, as established by the Surgeon General.",
                    },
                    {
                      q: "Can air purifiers eliminate secondhand smoke?",
                      a: "Air purifiers may reduce some particles, but cannot remove all toxins or gases from tobacco smoke. Elimination at the source is the only guaranteed protection.",
                    },
                    {
                      q: "What are the best ways to protect my family?",
                      a: "Make your home and car smoke-free, encourage smokers to quit, and avoid places where smoking occurs.",
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

        {/* ── ACTION + METHODOLOGY ────────────────────────────────── */}
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
              {/* Take Action */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,92,26,.15) 0%, rgba(255,92,26,.04) 100%)",
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
                  {t.actionTitle}
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
                    label: isHU
                      ? "American Lung Association"
                      : "American Lung Association",
                  },
                  {
                    href: "https://www.tobaccofreekids.org/",
                    label: isHU
                      ? "Campaign for Tobacco-Free Kids"
                      : "Campaign for Tobacco-Free Kids",
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
                      transition: "color .2s",
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

              {/* Methodology */}
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
                    ? "A modell konzervatív becslést alkalmaz: napi 1,5 cigaretta azok számára, akik magas kitettségű háztartásban élnek (PM₂.₅: 70–150 μg/m³)."
                    : "Our model uses a conservative estimate of 1.5 cigarettes/day for individuals living in high-exposure households, based on mean PM₂.₅ concentrations of 70–150 μg/m³."}
                </p>
                {[
                  {
                    code: "[SRC 01]",
                    text: isHU
                      ? "U.S. Surgeon General Report, 2006"
                      : "U.S. Surgeon General Report, 2006",
                  },
                  {
                    code: "[SRC 02]",
                    text: isHU
                      ? "IARC Monograph Vol. 83: Tobacco Smoke"
                      : "IARC Monograph Vol. 83: Tobacco Smoke",
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

        {/* ── FOOTER ──────────────────────────────────────────────── */}
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
                  background: "linear-gradient(135deg, var(--orange), #ff9f50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                💨
              </div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>
                invisible<span style={{ color: "var(--orange)" }}>inhale</span>
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
              {t.disclaimer}
            </p>
            <p
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

        {/* ── CHEMICAL MODAL ──────────────────────────────────────── */}
        {modalOpen &&
          selectedChem &&
          (() => {
            // Type guard: ensure selectedChem is a valid ChemicalName
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
                        color: color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {chemData.toxicity}
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
                        {val}
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
                    → {chemData.source}
                  </a>
                </div>
              </div>
            );
          })()}
      </div>
    </>
  );
}
