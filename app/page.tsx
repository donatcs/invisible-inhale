"use client";
import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

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

// ─── Fonts + Global CSS ───────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #06090f;
      --surface: #0f252d88;
      --card:    #0f252d88;
      --border:  rgba(255, 255, 255, 0.1);
      --bord2:   rgba(255,255,255,.2);
      --teal:    #1bf2c2;
      --teal-d:  rgba(15,223,176,.08);
      --amber:   #f59e0b;
      --red:     #f43f5e;
      --white:   #f1f5f9;
      --muted:   rgba(241,245,249,.58);
      --dim:     rgba(241,245,249,.34);
      --sans:    'Outfit', sans-serif;
      --mono:    'IBM Plex Mono', monospace;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--white);
      font-family: var(--sans);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* single subtle vignette on the page — no orbs */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(15,223,176,.04) 0%, transparent 70%);
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ticker {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes radioactive { 0%,100%{opacity:1} 50%{opacity:.35} }

    .fu  { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both; }
    .d1  { animation-delay: .05s; } .d2 { animation-delay: .14s; }
    .d3  { animation-delay: .23s; } .d4 { animation-delay: .34s; }
    .d5  { animation-delay: .46s; } .d6 { animation-delay: .6s;  }

    /* ── NAV ─────────────────────────────────────────── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      height: 54px;
      background: rgba(6,9,15,.88);
      backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center;
      padding: 0 22px;
    }
    .nav-logo {
      font-family: var(--sans); font-weight: 800; font-size: 16px;
      letter-spacing: -.03em; color: var(--white); text-decoration: none;
      margin-right: auto;
    }
    .nav-logo b { color: var(--teal); }
    .nav-pill {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 500;
      color: var(--muted); text-decoration: none;
      padding: 5px 11px; border-radius: 6px;
      transition: color .15s, background .15s;
    }
    .nav-pill:hover { color: var(--white); background: rgba(255,255,255,.05); }
    .nav-pill.active {
      color: var(--teal); background: var(--teal-d);
    }
    .nav-soon {
      font-family: var(--mono); font-size: 8px; font-weight: 500;
      color: var(--amber); letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(245,158,11,.3); border-radius: 3px;
      padding: 1px 5px; margin-left: 2px; vertical-align: middle;
    }
    .nav-cta {
      font-size: 13px; font-weight: 700; letter-spacing: -.01em;
      color: var(--bg); background: var(--teal);
      padding: 7px 15px; border-radius: 7px; text-decoration: none;
      transition: opacity .15s, transform .15s;
    }
    .nav-cta:hover { opacity: .88; transform: translateY(-1px); }
    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      width: 36px; height: 36px; align-items: center; justify-content: center;
      background: transparent; border: 1px solid var(--border); border-radius: 6px; cursor: pointer;
    }
    .hamburger span { display: block; width: 15px; height: 1.5px; background: var(--white); border-radius: 2px; transition: .2s; }
    .mobile-menu {
      display: none; position: fixed; top: 58px; left: 0; right: 0;
      background: rgba(6,9,15,.97); backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--border);
      padding: 12px 20px 20px; z-index: 99; flex-direction: column; gap: 4px;
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu .nav-pill { padding: 11px 14px; font-size: 14px; }

    /* ── SECTION ANATOMY ─────────────────────────────── */
    .section-label {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 28px;
    }
    .section-label-bar {
      width: 28px; height: 2px; background: var(--teal); flex-shrink: 0;
    }
    .section-label-txt {
      font-family: var(--mono); font-size: 10px; font-weight: 500;
      letter-spacing: .18em; text-transform: uppercase; color: var(--teal);
    }
    .section-label-line { flex: 1; height: 1px; background: var(--border); }

    .section-h {
      font-size: clamp(24px,3.6vw,36px); font-weight: 800;
      letter-spacing: -.04em; line-height: 1.05; color: var(--white);
      margin-bottom: 10px;
    }
    .section-sub {
      font-size: 14px; font-weight: 400; color: var(--muted);
      line-height: 1.62; max-width: 520px;
    }

    /* ── CARD ─────────────────────────────────────────── */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,.22);
      transition: border-color .2s, transform .2s, box-shadow .2s;
    }
    .card:hover {
      border-color: var(--bord2);
      transform: translateY(-1px);
      box-shadow: 0 16px 36px rgba(0,0,0,.28);
    }

    /* ── STAT CELL ────────────────────────────────────── */
    .stat-cell {
      padding: 18px;
      border-top: 2px solid var(--border);
      transition: border-color .2s;
    }
    .stat-cell:hover { border-top-color: var(--teal); }
    .stat-cell-label {
      font-family: var(--mono); font-size: 9px; font-weight: 500;
      letter-spacing: .14em; text-transform: uppercase;
      color: var(--dim); margin-bottom: 10px; display: block;
    }
    .stat-cell-val {
      font-family: var(--mono); font-size: 24px; font-weight: 500;
      letter-spacing: -.02em; line-height: 1; display: block; margin-bottom: 4px;
    }
    .stat-cell-note {
      font-family: var(--mono); font-size: 10px; color: var(--dim);
    }

    /* ── INPUTS ───────────────────────────────────────── */
    .field-label {
      display: block; font-size: 11px; font-weight: 600;
      letter-spacing: -.01em; color: var(--muted); margin-bottom: 7px;
    }
    .inp {
      width: 100%; padding: 9px 12px;
      background: rgba(255,255,255,.03);
      border: 1px solid var(--border);
      border-radius: 7px; color: var(--white);
      font-family: var(--mono); font-size: 13px;
      outline: none; appearance: none;
      transition: border-color .15s, background .15s;
    }
    .inp:focus {
      border-color: var(--teal);
      background: rgba(15,223,176,.04);
    }
    .inp-group { margin-bottom: 12px; }

    /* ── TABLE ────────────────────────────────────────── */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      font-family: var(--mono); font-size: 9px; font-weight: 500;
      letter-spacing: .15em; text-transform: uppercase; color: var(--dim);
      padding: 10px 14px; text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .data-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 12px; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tbody tr { transition: background .15s; }
    .data-table tbody tr:hover { background: rgba(255,255,255,.02); }

    /* ── BADGE ────────────────────────────────────────── */
    .badge {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--teal-d); border: 1px solid rgba(15,223,176,.2);
      border-radius: 5px; padding: 4px 11px;
      font-family: var(--mono); font-size: 10px; font-weight: 500;
      letter-spacing: .14em; color: var(--teal); text-transform: uppercase;
    }
    .badge-dot {
      width: 5px; height: 5px; border-radius: 50%; background: var(--teal);
      animation: blink 2.5s ease-in-out infinite;
    }

    /* ── RISK BAR ─────────────────────────────────────── */
    .risk-bar-bg {
      width: 100%; height: 4px; border-radius: 2px;
      background: rgba(255,255,255,.07); overflow: hidden;
    }
    .risk-bar-fill { height: 100%; border-radius: 2px; }

    /* ── TICKER ───────────────────────────────────────── */
    .ticker-wrap {
      overflow: hidden; border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 8px 0; background: var(--surface);
    }
    .ticker-track {
      display: flex; animation: ticker 36s linear infinite;
      width: max-content;
    }
    .ticker-item {
      display: flex; align-items: center; gap: 10px;
      padding: 0 28px; white-space: nowrap;
      font-family: var(--mono); font-size: 10px; font-weight: 400;
      color: var(--dim); letter-spacing: .1em; text-transform: uppercase;
    }
    .ticker-sep { width: 4px; height: 4px; border-radius: 50%; background: var(--teal); opacity: .6; }

    /* ── MODAL ────────────────────────────────────────── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(6,9,15,.85); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .modal-box {
      background: var(--card); border: 1px solid var(--bord2);
      border-radius: 12px; padding: 24px; max-width: 460px; width: 100%;
      position: relative;
    }

    /* ── COTININE READOUT ─────────────────────────────── */
    .cotinine-block {
      padding: 24px 24px 20px;
      border-bottom: 1px solid var(--border);
    }
    .cotinine-eyebrow {
      font-family: var(--mono); font-size: 9px; font-weight: 500;
      letter-spacing: .18em; text-transform: uppercase;
      color: var(--dim); margin-bottom: 12px; display: flex; align-items: center; gap: 10px;
    }
    .cotinine-eyebrow::before { content:''; display:block; width:20px; height:1px; background:var(--teal); }
    .cotinine-num {
      font-family: var(--mono); font-size: clamp(44px,6vw,72px);
      font-weight: 400; letter-spacing: -.03em; line-height: 1;
    }
    .cotinine-unit { font-size: .35em; color: var(--muted); vertical-align: baseline; margin-left: 6px; }
    .cotinine-tag {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 4px;
      font-family: var(--mono); font-size: 10px; font-weight: 500;
      letter-spacing: .1em; text-transform: uppercase;
      margin-left: 16px; vertical-align: middle;
    }
    .cotinine-ref {
      font-family: var(--mono); font-size: 10px; color: var(--dim);
      line-height: 1.9; margin-top: 14px;
    }

    /* ── RANGE SLIDER ─────────────────────────────────── */
    input[type=range] {
      -webkit-appearance: none; width: 100%; height: 2px;
      border-radius: 2px; outline: none; cursor: pointer;
      background: rgba(255,255,255,.1);
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 14px; height: 14px;
      border-radius: 50%; background: var(--teal);
      border: 2px solid var(--bg);
      box-shadow: 0 0 0 3px rgba(15,223,176,.15);
    }

    /* ── SCROLLBAR ─────────────────────────────────────── */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }

    /* ── RESPONSIVE ────────────────────────────────────── */
    @media (max-width: 900px) {
      .nav-links-row { display: none !important; }
      .hamburger { display: flex !important; }
    }
    @media (max-width: 768px) {
      .calc-grid { grid-template-columns: 1fr !important; }
      .results-grid-3 { grid-template-columns: 1fr !important; }
      .results-grid-2 { grid-template-columns: 1fr !important; }
      .timeline-grid { grid-template-columns: 1fr !important; }
      .action-grid { grid-template-columns: 1fr !important; }
      .hero-stats { grid-template-columns: 1fr !important; }
      .faq-row { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Calculator", href: "#calculator" },
  { label: "Chemicals", href: "#chemicals" },
  { label: "News", href: "/news", soon: true },
  { label: "Research", href: "/research", soon: true },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SmokeTracker() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChem, setSelectedChem] = useState<string | null>(null);

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
      ? "#0fdfb0"
      : result.biomarker.interpretation === "low"
        ? "#f59e0b"
        : result.biomarker.interpretation === "moderate"
          ? "#fb923c"
          : "#f43f5e"
    : "#0fdfb0";

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <>
      <FontLink />
      <div
        style={{
          background: "var(--bg)",
          minHeight: "100vh",
          fontFamily: "var(--sans)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── NAV ─────────────────────────────────────────── */}
        <nav>
          <a href="#" className="nav-logo">
            invisible<b>inhale</b>
          </a>

          <div
            className="nav-links-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginRight: 20,
            }}
          >
            {NAV_LINKS.map(({ label, href, soon }) => (
              <a
                key={label}
                href={soon ? undefined : href}
                className="nav-pill"
                style={{
                  cursor: soon ? "default" : "pointer",
                  opacity: soon ? 0.5 : 1,
                  pointerEvents: soon ? "none" : undefined,
                }}
              >
                {label}
                {soon && <span className="nav-soon">soon</span>}
              </a>
            ))}
          </div>

          <a href="/quiz" className="nav-cta">
            Take the Quiz →
          </a>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ marginLeft: 12 }}
            aria-label="Menu"
          >
            <span
              style={{
                transform: menuOpen
                  ? "rotate(45deg) translate(4px,4px)"
                  : "none",
              }}
            />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span
              style={{
                transform: menuOpen
                  ? "rotate(-45deg) translate(4px,-4px)"
                  : "none",
              }}
            />
          </button>
        </nav>

        {/* ── MOBILE MENU ─────────────────────────────────── */}
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map(({ label, href, soon }) => (
            <a
              key={label}
              href={soon ? undefined : href}
              className="nav-pill"
              style={{ opacity: soon ? 0.45 : 1 }}
              onClick={() => !soon && setMenuOpen(false)}
            >
              {label} {soon && <span className="nav-soon">soon</span>}
            </a>
          ))}
          <a
            href="/quiz"
            className="nav-pill active"
            style={{ marginTop: 8 }}
            onClick={() => setMenuOpen(false)}
          >
            Take the Quiz →
          </a>
        </div>

        {/* ── TICKER ──────────────────────────────────────── */}
        <div className="ticker-wrap" style={{ marginTop: 58 }}>
          <div className="ticker-track">
            {[
              "7,000+ chemicals",
              "70+ known carcinogens",
              "No safe level of exposure",
              "Polonium-210 is radioactive",
              "3× sidestream vs mainstream",
              "Children breathe 2× faster",
              "Persists on surfaces for hours",
              "7,000+ chemicals",
              "70+ known carcinogens",
              "No safe level of exposure",
              "Polonium-210 is radioactive",
              "3× sidestream vs mainstream",
              "Children breathe 2× faster",
              "Persists on surfaces for hours",
            ].map((t, i) => (
              <div key={i} className="ticker-item">
                <span className="ticker-sep" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          style={{
            padding: "80px 24px 56px",
            maxWidth: 1040,
            margin: "0 auto",
          }}
        >
          <div className="fu" style={{ marginBottom: 28 }}>
            <span className="badge">
              <span className="badge-dot" />
              Science-backed Exposure Platform
            </span>
          </div>

          <h1
            className="fu d1"
            style={{
              fontSize: "clamp(42px, 7vw, 88px)",
              fontWeight: 900,
              letterSpacing: "-.045em",
              lineHeight: 0.95,
              color: "var(--white)",
              marginBottom: 28,
              maxWidth: 820,
            }}
          >
            Secondhand smoke is a measurable harm.
          </h1>

          <p
            className="fu d2"
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: "var(--muted)",
              lineHeight: 1.75,
              maxWidth: 540,
              marginBottom: 40,
            }}
          >
            Even when you can't see it. Calculate your personal exposure to 8
            pollutants using peer-reviewed scientific models — and understand
            what it means for your health.
          </p>

          <div
            className="fu d3"
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 72,
            }}
          >
            <a
              href="#calculator"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                borderRadius: 8,
                background: "var(--teal)",
                color: "var(--bg)",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "-.01em",
                textDecoration: "none",
                transition: "opacity .15s, transform .15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = ".88";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "none";
              }}
            >
              Calculate My Exposure →
            </a>
            <a
              href="#chemicals"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 24px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                fontWeight: 500,
                fontSize: 14,
                textDecoration: "none",
                transition: "border-color .15s, color .15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--bord2)";
                e.currentTarget.style.color = "var(--white)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              See Chemicals
            </a>
          </div>

          {/* Hero stats strip */}
          <div
            className="hero-stats fu d4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 1,
              background: "var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            {[
              {
                val: "7,000+",
                label: "Chemicals in smoke",
                color: "var(--white)",
              },
              { val: "70+", label: "Known carcinogens", color: "var(--amber)" },
              { val: "0%", label: "Safe exposure level", color: "var(--red)" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "28px 24px",
                  background: "var(--card)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 32,
                    fontWeight: 500,
                    color: s.color,
                    letterSpacing: "-.02em",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "var(--dim)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CALCULATOR ───────────────────────────────────── */}
        <section
          id="calculator"
          style={{ padding: "0 24px 72px", maxWidth: 1040, margin: "0 auto" }}
        >
          <div className="section-label">
            <div className="section-label-bar" />
            <span className="section-label-txt">
              Scientific Exposure Engine
            </span>
            <div className="section-label-line" />
          </div>

          <div
            style={{
              marginBottom: 36,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h2 className="section-h">Risk Calculator</h2>
              <p className="section-sub">
                6 scientific layers: physical model, multi-pollutant output,
                person-specific exposure, biomarker estimation, health risk,
                lifetime model.
              </p>
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--dim)",
                lineHeight: 1.6,
                textAlign: "right",
                maxWidth: 280,
              }}
            >
              Model: EPA CONTAM · Repace &amp; Lowrey 1980
              <br />
              WHO 2010 · Surgeon General 2006 · IARC Vol.83
              <br />
              <span style={{ color: "var(--teal)", opacity: 0.7 }}>
                All calculations run locally — no data transmitted
              </span>
            </div>
          </div>

          {/* Input grid */}
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "16px 20px",
                marginBottom: 24,
              }}
              className="calc-grid"
            >
              {/* Row 1 */}
              <div className="inp-group">
                <label className="field-label">Years Exposed</label>
                <input
                  type="number"
                  className="inp"
                  min={1}
                  max={50}
                  value={years || ""}
                  onChange={(e) => setYears(Number(e.target.value))}
                />
              </div>
              <div className="inp-group">
                <label className="field-label">Cigarettes / Day Nearby</label>
                <input
                  type="number"
                  className="inp"
                  min={1}
                  max={60}
                  value={cigsPerDay || ""}
                  onChange={(e) => setCigsPerDay(Number(e.target.value))}
                />
              </div>
              <div className="inp-group">
                <label className="field-label">Smokers Present</label>
                <input
                  type="number"
                  className="inp"
                  min={1}
                  max={10}
                  value={smokers || ""}
                  onChange={(e) => setSmokers(Number(e.target.value))}
                />
              </div>
              {/* Row 2 */}
              <div className="inp-group">
                <label className="field-label">Room Volume (m³)</label>
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
              <div className="inp-group">
                <label className="field-label">Ventilation Type</label>
                <select
                  className="inp"
                  value={vent}
                  onChange={(e) => setVent(e.target.value as VentilationType)}
                >
                  <option value="none">None (0.3 ACH)</option>
                  <option value="natural">Natural Draft (1.5 ACH)</option>
                  <option value="hvac">Mechanical HVAC (4 ACH)</option>
                  <option value="hepa">HEPA Filtration (8 ACH)</option>
                </select>
              </div>
              <div className="inp-group">
                <label className="field-label">Room Geometry</label>
                <select
                  className="inp"
                  value={geo}
                  onChange={(e) => setGeo(e.target.value as RoomGeometry)}
                >
                  <option value="small_closed">Small Closed Room</option>
                  <option value="medium_room">Medium Room</option>
                  <option value="open_plan">Open Plan</option>
                  <option value="outdoor_partial">Partially Outdoor</option>
                </select>
              </div>
              {/* Row 3 */}
              <div className="inp-group">
                <label className="field-label">Distance from Smoker (m)</label>
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
              <div className="inp-group">
                <label className="field-label">Temperature (°C)</label>
                <input
                  type="number"
                  className="inp"
                  min={10}
                  max={40}
                  value={tempC || ""}
                  onChange={(e) => setTempC(Number(e.target.value))}
                />
              </div>
              <div className="inp-group">
                <label className="field-label">Relative Humidity (%)</label>
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
              {/* Row 4 */}
              <div className="inp-group">
                <label className="field-label">Age Group</label>
                <select
                  className="inp"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                >
                  <option value="infant">Infant (0–2)</option>
                  <option value="child">Child (3–12)</option>
                  <option value="teen">Teen (13–17)</option>
                  <option value="adult">Adult (18–64)</option>
                  <option value="elderly">Elderly (65+)</option>
                </select>
              </div>
              <div className="inp-group">
                <label className="field-label">Activity Level</label>
                <select
                  className="inp"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                >
                  <option value="resting">Resting (0.5 m³/hr)</option>
                  <option value="light">Light (0.85 m³/hr)</option>
                  <option value="moderate">Moderate (2.0 m³/hr)</option>
                  <option value="heavy">Heavy (3.5 m³/hr)</option>
                </select>
              </div>
              <div className="inp-group">
                <label className="field-label">Pre-existing Condition</label>
                <select
                  className="inp"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                >
                  <option value="none">None</option>
                  <option value="asthma">Asthma (×1.6)</option>
                  <option value="copd">COPD (×1.8)</option>
                  <option value="cardiovascular">Cardiovascular (×1.4)</option>
                  <option value="pregnant">Pregnant (×1.3)</option>
                </select>
              </div>
              {/* Row 5 */}
              <div className="inp-group">
                <label className="field-label">Body Weight (kg)</label>
                <input
                  type="number"
                  className="inp"
                  min={3}
                  max={200}
                  value={weight || ""}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>
              <div className="inp-group">
                <label className="field-label">
                  Soft Furnishings / Carpets
                </label>
                <select
                  className="inp"
                  value={furn ? "yes" : "no"}
                  onChange={(e) => setFurn(e.target.value === "yes")}
                >
                  <option value="yes">Yes (×1.35 thirdhand)</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Exposure duration slider */}
            <div
              style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}
            >
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
                    fontSize: 11,
                    color: "var(--muted)",
                  }}
                >
                  Exposure Duration
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--teal)",
                  }}
                >
                  {years} years
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

          {/* ── RESULTS ─────────────────────────────────────── */}
          {result && (
            <>
              {/* Cotinine hero readout */}
              <div
                className="card"
                style={{ marginBottom: 16, overflow: "hidden" }}
              >
                <div className="cotinine-block">
                  <div className="cotinine-eyebrow">
                    Estimated Serum Cotinine · Clinical Biomarker
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <span className="cotinine-num" style={{ color: bioColor }}>
                      {result.biomarker.serumNgMl.toFixed(3)}
                      <span className="cotinine-unit">ng/mL</span>
                    </span>
                    <span
                      className="cotinine-tag"
                      style={{
                        background: `${bioColor}16`,
                        color: bioColor,
                        border: `1px solid ${bioColor}33`,
                      }}
                    >
                      {result.biomarker.label.EN}
                    </span>
                  </div>
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: "var(--muted)",
                      lineHeight: 1.65,
                      maxWidth: 520,
                    }}
                  >
                    {result.biomarker.note.EN}
                  </p>
                  <div className="cotinine-ref">
                    {"< 0.05"} — Background &nbsp;·&nbsp;
                    {"0.05–1.0"} — Low SHS &nbsp;·&nbsp;
                    <span style={{ color: "#fb923c" }}>
                      {"1.0–10"} — Moderate ⚠
                    </span>{" "}
                    &nbsp;·&nbsp;
                    <span style={{ color: "var(--red)" }}>{"> 10"} — High</span>
                    &nbsp;&nbsp;
                    <span style={{ color: "var(--dim)", fontSize: 9 }}>
                      CDC NHANES
                    </span>
                  </div>
                </div>

                {/* Key stats */}
                <div
                  className="results-grid-3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 1,
                    background: "var(--border)",
                  }}
                >
                  {[
                    {
                      label: "Equiv. Cigarettes / Day",
                      value: result.equivCigs.toFixed(3),
                      note: "PM₂.₅ basis",
                      color: "#fb923c",
                    },
                    {
                      label: "Lifetime Pack-Years",
                      value: result.equivPackYears.toFixed(2),
                      note: "smoker equiv.",
                      color: "#f59e0b",
                    },
                    {
                      label: "Safe Re-entry Time",
                      value:
                        result.safeReentryMin > 0
                          ? `${result.safeReentryMin} min`
                          : "✓ Safe",
                      note: "WHO PM₂.₅",
                      color:
                        result.safeReentryMin > 0
                          ? "var(--red)"
                          : "var(--teal)",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="stat-cell"
                      style={{ background: "var(--card)" }}
                    >
                      <span className="stat-cell-label">{s.label}</span>
                      <span
                        className="stat-cell-val"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </span>
                      <span className="stat-cell-note">{s.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share CTA */}
              <div
                className="card"
                style={{
                  padding: "18px 24px",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "-.01em",
                      marginBottom: 3,
                    }}
                  >
                    Share your exposure results
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--dim)",
                    }}
                  >
                    Cotinine: {result.biomarker.serumNgMl.toFixed(2)} ng/mL ·{" "}
                    {result.biomarker.label.EN}
                  </div>
                </div>
                <button
                  onClick={() => setShareOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: 7,
                    background: "transparent",
                    border: "1px solid var(--bord2)",
                    color: "var(--white)",
                    fontFamily: "var(--sans)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "-.01em",
                    transition: "border-color .15s, background .15s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--teal)";
                    e.currentTarget.style.background = "var(--teal-d)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--bord2)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  📤 Create Share Card
                </button>
              </div>

              {/* Multi-pollutant table */}
              <div
                className="card"
                style={{ marginBottom: 16, overflow: "hidden" }}
              >
                <div
                  style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: "-.02em",
                      marginBottom: 3,
                    }}
                  >
                    Multi-Pollutant Dose Analysis
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--dim)",
                    }}
                  >
                    Estimated inhaled dose per compound — daily exposure
                    scenario
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      {[
                        "Compound",
                        "Symbol",
                        "Daily Dose",
                        "% of Limit",
                        "Health Effect",
                      ].map((h, i) => (
                        <th
                          key={h}
                          style={{ textAlign: i > 1 ? "center" : "left" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.pollutants.map((p) => (
                      <tr key={p.symbol}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: p.color,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{ fontWeight: 600, color: "var(--white)" }}
                            >
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontFamily: "var(--mono)",
                            fontSize: 12,
                            color: p.color,
                          }}
                        >
                          {p.symbol}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontFamily: "var(--mono)",
                            fontSize: 12,
                            color: "var(--white)",
                          }}
                        >
                          {p.doseUg < 0.01
                            ? p.doseUg.toExponential(2)
                            : p.doseUg.toFixed(2)}{" "}
                          μg
                        </td>
                        <td style={{ textAlign: "center" }}>
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
                                className="risk-bar-bg"
                                style={{ width: 60 }}
                              >
                                <div
                                  className="risk-bar-fill"
                                  style={{
                                    width: `${Math.min(100, p.percentOfLimit)}%`,
                                    background:
                                      p.percentOfLimit > 100
                                        ? "var(--red)"
                                        : p.percentOfLimit > 50
                                          ? "#fb923c"
                                          : "var(--teal)",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: 10,
                                  color:
                                    p.percentOfLimit > 100
                                      ? "var(--red)"
                                      : "var(--dim)",
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
                                color: "var(--red)",
                              }}
                            >
                              no safe level
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            fontSize: 12,
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
              <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: "-.02em",
                    marginBottom: 20,
                  }}
                >
                  Health Risk Quantification
                </div>
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
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: "-.01em",
                            color: "var(--white)",
                            marginBottom: 2,
                          }}
                        >
                          {r.condition}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            color: "var(--dim)",
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {r.affectsGroup} · {r.source}
                        </div>
                      </div>
                      <div style={{ flex: "0 0 64px", textAlign: "center" }}>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 18,
                            fontWeight: 500,
                            color:
                              r.rrIncrease > 1.5
                                ? "var(--red)"
                                : r.rrIncrease > 1.2
                                  ? "#fb923c"
                                  : "var(--amber)",
                            lineHeight: 1,
                          }}
                        >
                          ×{r.rrIncrease.toFixed(2)}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            color: "var(--dim)",
                            marginTop: 2,
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
                            marginBottom: 5,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: 10,
                              color: "var(--dim)",
                            }}
                          >
                            Baseline: {r.baselineRisk}%
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: 10,
                              color: "var(--red)",
                            }}
                          >
                            +{r.absolutePct.toFixed(2)}%
                          </span>
                        </div>
                        <div className="risk-bar-bg">
                          <div
                            className="risk-bar-fill"
                            style={{
                              width: `${Math.min(100, (r.baselineRisk / 20) * 100)}%`,
                              background: "rgba(255,255,255,.15)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "var(--dim)",
                    marginTop: 16,
                    lineHeight: 1.6,
                  }}
                >
                  * RR = relative risk multiplier. Based on published
                  meta-analyses. Not a diagnostic tool.
                </div>
              </div>

              {/* PM2.5 + Thirdhand */}
              <div
                className="results-grid-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div className="card" style={{ padding: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 9,
                      color: "var(--dim)",
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Ambient PM₂.₅ Concentration
                  </div>
                  <div style={{ display: "flex", gap: 32, marginBottom: 10 }}>
                    {[
                      {
                        val: result.peakPm25,
                        label: "μg/m³ peak",
                        color:
                          result.peakPm25 > 150
                            ? "var(--red)"
                            : result.peakPm25 > 55
                              ? "#fb923c"
                              : "var(--amber)",
                      },
                      {
                        val: result.avgPm25,
                        label: "μg/m³ avg",
                        color: "var(--amber)",
                      },
                    ].map((s) => (
                      <div key={s.label}>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 28,
                            fontWeight: 500,
                            color: s.color,
                            letterSpacing: "-.02em",
                            lineHeight: 1,
                          }}
                        >
                          {s.val}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 10,
                            color: "var(--dim)",
                            marginTop: 4,
                          }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--dim)",
                    }}
                  >
                    WHO 24h limit: 15 μg/m³ · Your level:{" "}
                    {((result.avgPm25 / 15) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 9,
                      color: "var(--dim)",
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Thirdhand Smoke Load
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 28,
                      fontWeight: 500,
                      letterSpacing: "-.02em",
                      lineHeight: 1,
                      marginBottom: 4,
                      color:
                        result.thirdhand > 60
                          ? "var(--red)"
                          : result.thirdhand > 30
                            ? "#fb923c"
                            : "var(--amber)",
                    }}
                  >
                    {result.thirdhand}
                    <span style={{ fontSize: 14, color: "var(--dim)" }}>
                      /100
                    </span>
                  </div>
                  <div className="risk-bar-bg" style={{ marginBottom: 10 }}>
                    <div
                      className="risk-bar-fill"
                      style={{
                        width: `${result.thirdhand}%`,
                        background: `linear-gradient(90deg, var(--amber), ${result.thirdhand > 60 ? "var(--red)" : "#fb923c"})`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--dim)",
                      lineHeight: 1.6,
                    }}
                  >
                    Surface nicotine re-emission after smoking ends.
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "-.02em",
                  marginBottom: 4,
                }}
              >
                Cumulative Exposure Over Time
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--dim)",
                }}
              >
                {years}-year period · PM₂.₅-based equivalent cigarettes
              </div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#0fdfb0"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#0fdfb0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="var(--dim)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="var(--mono)"
                  />
                  <YAxis
                    stroke="var(--dim)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="var(--mono)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                    }}
                    itemStyle={{ color: "#0fdfb0" }}
                    labelStyle={{ color: "var(--muted)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cigs"
                    stroke="#0fdfb0"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#gradTeal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── HEALTH TIMELINE ──────────────────────────────── */}
        {result && result.timeline.length > 0 && (
          <section
            style={{ padding: "0 24px 72px", maxWidth: 1040, margin: "0 auto" }}
          >
            <div className="section-label">
              <div className="section-label-bar" />
              <span className="section-label-txt">
                Based on {years}-year exposure
              </span>
              <div className="section-label-line" />
            </div>
            <h2 className="section-h" style={{ marginBottom: 32 }}>
              Health Timeline
            </h2>
            <div
              className="timeline-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: 12,
              }}
            >
              {result.timeline.map((item, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: "20px 22px",
                    borderLeft: `2px solid ${item.color}`,
                    borderRadius: "0 10px 10px 0",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: item.color,
                      letterSpacing: ".1em",
                      marginBottom: 6,
                    }}
                  >
                    Year {item.year}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--white)",
                      lineHeight: 1.65,
                    }}
                  >
                    {item.event.EN}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CHEMICALS ────────────────────────────────────── */}
        <section
          id="chemicals"
          style={{ padding: "0 24px 72px", maxWidth: 1040, margin: "0 auto" }}
        >
          <div className="section-label">
            <div className="section-label-bar" />
            <span className="section-label-txt">Toxicology</span>
            <div className="section-label-line" />
          </div>
          <h2 className="section-h">The Chemical Payload</h2>
          <p className="section-sub" style={{ marginBottom: 32 }}>
            Found in sidestream smoke at higher concentrations than mainstream
            smoke.
          </p>

          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chemical</th>
                  <th>Industrial Use</th>
                  <th style={{ textAlign: "center" }}>Toxicity</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {Object.entries(CHEMICALS).map(([name, data], i) => (
                  <tr key={name}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background:
                              TOXICITY_COLORS[
                                data.level as keyof typeof TOXICITY_COLORS
                              ],
                            flexShrink: 0,
                            ...(name === "Polonium-210"
                              ? { animation: "radioactive 1.2s infinite" }
                              : {}),
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "var(--white)",
                          }}
                        >
                          {name}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--muted)",
                      }}
                    >
                      {data.use.EN}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 11px",
                          borderRadius: 4,
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: ".06em",
                          background: `${TOXICITY_COLORS[data.level as keyof typeof TOXICITY_COLORS]}18`,
                          color:
                            TOXICITY_COLORS[
                              data.level as keyof typeof TOXICITY_COLORS
                            ],
                          border: `1px solid ${TOXICITY_COLORS[data.level as keyof typeof TOXICITY_COLORS]}35`,
                        }}
                      >
                        {data.toxicity.EN}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => {
                          setSelectedChem(name);
                          setModalOpen(true);
                        }}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "5px 13px",
                          color: "var(--muted)",
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "var(--mono)",
                          fontWeight: 400,
                          transition: "border-color .15s, color .15s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor = "var(--teal)";
                          e.currentTarget.style.color = "var(--teal)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.color = "var(--muted)";
                        }}
                      >
                        details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section
          style={{ padding: "0 24px 72px", maxWidth: 1040, margin: "0 auto" }}
        >
          <div className="section-label">
            <div className="section-label-bar" />
            <span className="section-label-txt">Common Questions</span>
            <div className="section-label-line" />
          </div>
          <h2 className="section-h" style={{ marginBottom: 32 }}>
            FAQ
          </h2>

          <div
            style={{
              display: "grid",
              gap: 1,
              background: "var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            {[
              {
                q: "Is secondhand smoke really dangerous?",
                a: "Yes. There is no safe level. It contains thousands of chemicals, many toxic or carcinogenic. Even minutes of exposure can measurably affect blood vessels and lung function.",
              },
              {
                q: "Can air purifiers eliminate the risk?",
                a: "Purifiers reduce some particles but can't remove all gases and toxins. Only a fully smoke-free environment provides complete protection.",
              },
              {
                q: "What is thirdhand smoke?",
                a: "Residue clinging to surfaces, clothes, and furniture long after smoking stops. Can be inhaled, ingested, or absorbed through skin — especially dangerous for infants.",
              },
              {
                q: "How accurate is this calculator?",
                a: "It uses peer-reviewed models (EPA CONTAM, Repace & Lowrey 1980, WHO 2010, Surgeon General 2006). It's a population-level estimate, not a clinical measurement. Consult a doctor for personal assessment.",
              },
            ].map(({ q, a }, i) => (
              <div
                key={i}
                className="faq-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                  background: "var(--card)",
                }}
              >
                <div
                  style={{
                    padding: "24px 28px",
                    borderRight: "1px solid var(--border)",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: "-.02em",
                    lineHeight: 1.35,
                    color: "var(--white)",
                  }}
                >
                  {q}
                </div>
                <div
                  style={{
                    padding: "24px 28px",
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.75,
                  }}
                >
                  {a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ACTION + METHODOLOGY ─────────────────────────── */}
        <section
          style={{ padding: "0 24px 72px", maxWidth: 1040, margin: "0 auto" }}
        >
          <div
            className="action-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div className="card" style={{ padding: 28 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "-.02em",
                  marginBottom: 20,
                }}
              >
                Take Action
              </div>
              {[
                {
                  href: "https://smokefree.gov/",
                  label: "Smokefree.gov — Free quit resources",
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
                    borderBottom: "1px solid var(--border)",
                    color: "var(--muted)",
                    textDecoration: "none",
                    fontSize: 13,
                    transition: "color .15s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = "var(--teal)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = "var(--muted)")
                  }
                >
                  <span
                    style={{
                      color: "var(--teal)",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                    }}
                  >
                    →
                  </span>
                  {label}
                </a>
              ))}
            </div>
            <div className="card" style={{ padding: 28 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "-.02em",
                  marginBottom: 16,
                }}
              >
                Scientific Methodology
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                The engine combines the Repace & Lowrey 1980 mass-balance model,
                EPA CONTAM, and WHO 2010 guidelines. 8 pollutants modelled
                individually with person-specific breathing rates.
              </p>
              {[
                { code: "SRC 01", text: "U.S. Surgeon General Report, 2006" },
                {
                  code: "SRC 02",
                  text: "IARC Monograph Vol. 83: Tobacco Smoke",
                },
                {
                  code: "SRC 03",
                  text: "Repace & Lowrey 1980 — Indoor SHS Model",
                },
                {
                  code: "SRC 04",
                  text: "WHO Indoor Air Quality Guidelines, 2010",
                },
              ].map(({ code, text }) => (
                <div
                  key={code}
                  style={{
                    background: "rgba(255,255,255,.02)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 14px",
                    marginBottom: 8,
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: "var(--teal)", marginRight: 10 }}>
                    [{code}]
                  </span>
                  <span style={{ color: "var(--dim)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            padding: "40px 32px",
            maxWidth: 1040,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "-.03em",
                  marginBottom: 8,
                }}
              >
                invisible<b style={{ color: "var(--teal)" }}>inhale</b>
              </div>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--dim)",
                  lineHeight: 1.7,
                  maxWidth: 440,
                }}
              >
                Educational platform. Not a substitute for medical advice.
                <br />
                All calculations run locally in your browser — no data collected
                or transmitted.
              </p>
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--dim)",
                textAlign: "right",
                lineHeight: 1.8,
              }}
            >
              © {new Date().getFullYear()} Invisible Inhale
              <br />
              Science-backed · Privacy-first
            </div>
          </div>
        </footer>

        {/* ── CHEMICAL MODAL ───────────────────────────────── */}
        {modalOpen &&
          selectedChem &&
          (() => {
            if (!Object.keys(CHEMICALS).includes(selectedChem)) return null;
            const key = selectedChem as ChemicalName;
            const d = CHEMICALS[key];
            const col = TOXICITY_COLORS[d.level];
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
                      top: 14,
                      right: 14,
                      background: "rgba(255,255,255,.05)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      width: 30,
                      height: 30,
                      cursor: "pointer",
                      color: "var(--muted)",
                      fontSize: 16,
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
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: col,
                        ...(key === "Polonium-210"
                          ? { animation: "radioactive 1.2s infinite" }
                          : {}),
                      }}
                    />
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        letterSpacing: "-.03em",
                      }}
                    >
                      {key}
                    </h2>
                    <span
                      style={{
                        padding: "2px 9px",
                        borderRadius: 4,
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        fontWeight: 500,
                        background: `${col}18`,
                        color: col,
                        border: `1px solid ${col}35`,
                      }}
                    >
                      {d.toxicity.EN}
                    </span>
                  </div>
                  {[
                    { label: "Health Effects", val: d.healthEffects.EN },
                    { label: "Prevention", val: d.prevention.EN },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 9,
                          color: "var(--dim)",
                          letterSpacing: ".14em",
                          textTransform: "uppercase",
                          marginBottom: 7,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--white)",
                          lineHeight: 1.7,
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                  <a
                    href={d.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 16px",
                      borderRadius: 7,
                      background: "rgba(255,255,255,.04)",
                      border: "1px solid var(--border)",
                      color: "var(--teal)",
                      textDecoration: "none",
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                    }}
                  >
                    → {d.source.EN}
                  </a>
                </div>
              </div>
            );
          })()}

        {/* ── SHARE MODAL ──────────────────────────────────── */}
        {shareOpen && result && (
          <ShareModal
            result={result}
            years={years}
            cigsPerDay={cigsPerDay}
            isHU={false}
            onClose={() => setShareOpen(false)}
          />
        )}
      </div>
    </>
  );
}
