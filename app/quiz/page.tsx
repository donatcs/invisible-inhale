"use client";
import React, { useState, useEffect } from "react";

const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #06090f;
      --surface: #0d1324;
      --card:    #111a2e;
      --border:  rgba(255,255,255,.1);
      --bord2:   rgba(255,255,255,.2);
      --teal:    #1bf2c2;
      --teal-d:  rgba(15,223,176,.08);
      --amber:   #fb923c;
      --danger:  #ef4444;
      --red:     #f43f5e;
      --white:   #f1f5f9;
      --color:   #f1f5f9;
      --muted:   rgba(241,245,249,.58);
      --dim:     rgba(241,245,249,.34);
      --mono:    'IBM Plex Mono', monospace;
      --sans:    'Outfit', sans-serif;
      --serif:   'Outfit', sans-serif;
      --black:   var(--bg);
      --blue:    var(--teal);
      --blue-hover: rgba(27,242,194,.12);
      --orange:  var(--amber);
    }

    html, body { background: var(--bg); color: var(--color); font-family: var(--sans); -webkit-font-smoothing: antialiased; }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(15,223,176,.04) 0%, transparent 70%);
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes orb1 {
      0%,100% { transform: translate(0,0) scale(1); }
      33%      { transform: translate(50px,-30px) scale(1.08); }
      66%      { transform: translate(-20px,40px) scale(.95); }
    }
    @keyframes orb2 {
      0%,100% { transform: translate(0,0) scale(1); }
      33%      { transform: translate(-60px,50px) scale(1.05); }
      66%      { transform: translate(40px,-20px) scale(.92); }
    }
    @keyframes pulseDot {
      0%,100% { box-shadow: 0 0 0 0 rgba(56,189,248,.5); }
      50%      { box-shadow: 0 0 0 8px rgba(56,189,248,0); }
    }
    @keyframes gridPulse {
      0%,100% { opacity: .3; }
      50%      { opacity: .55; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(16px) scale(.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes correctPop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    @keyframes progressFill {
      from { width: 0%; }
      to   { width: var(--target-width); }
    }
    @keyframes scoreReveal {
      from { opacity: 0; transform: scale(.8); }
      to   { opacity: 1; transform: scale(1); }
    }

    .fade-up { animation: fadeUp .6s ease both; }
    .d1 { animation-delay: .1s; }
    .d2 { animation-delay: .2s; }
    .d3 { animation-delay: .3s; }
    .d4 { animation-delay: .4s; }

    .quiz-card {
      animation: slideIn .4s ease both;
    }

    .option-btn {
      width: 100%;
      text-align: left;
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--color);
      font-family: var(--sans);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: border-color .2s, background .2s, transform .15s;
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      overflow: hidden;
    }
    .option-btn:not(:disabled):hover {
      border-color: var(--bord2);
      background: rgba(15,223,176,.06);
      transform: translateY(-1px);
    }
    .option-btn:disabled { cursor: default; }
    .option-btn.selected-correct {
      border-color: #22c55e;
      background: rgba(34,197,94,.1);
      animation: correctPop .3s ease;
    }
    .option-btn.selected-wrong {
      border-color: #ef4444;
      background: rgba(239,68,68,.1);
    }
    .option-btn.reveal-correct {
      border-color: rgba(34,197,94,.4);
      background: rgba(34,197,94,.05);
    }

    .next-btn {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 12px 22px; border-radius: 8px;
      background: var(--teal);
      color: var(--bg); font-weight: 700; font-size: 13px;
      border: none; cursor: pointer;
      font-family: var(--sans); letter-spacing: -.01em;
      box-shadow: 0 0 24px rgba(15,223,176,.2);
      transition: background .2s, box-shadow .2s;
    }
    .next-btn:hover {
      background: #34f5cd;
      box-shadow: 0 0 30px rgba(15,223,176,.3);
    }

    .back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 14px; border-radius: 7px;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--muted); font-family: var(--sans);
      font-size: 13px; font-weight: 500;
      cursor: pointer; text-decoration: none;
      transition: border-color .2s, color .2s;
    }
    .back-btn:hover { border-color: var(--bord2); color: var(--color); }

    .score-ring {
      animation: scoreReveal .6s cubic-bezier(.34,1.56,.64,1) both;
    }

    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--teal-d);
      border: 1px solid rgba(15,223,176,.2);
      border-radius: 5px;
      padding: 4px 11px;
      font-size: 10px; font-weight: 500; letter-spacing: .14em;
      color: var(--teal); text-transform: uppercase;
      font-family: var(--mono);
    }
    .badge-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--teal);
      animation: pulseDot 2.5s ease-in-out infinite;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }

    @media (max-width: 480px) {
      .option-btn { font-size: 14px; padding: 14px 16px; }
      .quiz-inner { padding: 24px 20px !important; }
    }
  `}</style>
);

const questions = [
  {
    question: {
      EN: "Is there a safe level of exposure to secondhand smoke?",
      HU: "Van biztonságos szintje a passzív dohányzásnak?",
    },
    options: {
      EN: ["Yes, in small amounts", "No, none at all", "Only outdoors"],
      HU: [
        "Igen, kis mennyiségben",
        "Nem, egyáltalán nincs",
        "Csak a szabadban",
      ],
    },
    answer: 1,
    explanation: {
      EN: "There is no safe level of exposure to secondhand smoke. Even brief exposure can harm the cardiovascular and respiratory systems.",
      HU: "Nincs biztonságos szintje a passzív dohányzásnak. Már rövid idejű kitettség is károsíthatja a szív- és légzőrendszert.",
    },
    tag: { EN: "Exposure", HU: "Kitettség" },
  },
  {
    question: {
      EN: "Which chemical in secondhand smoke is a known carcinogen?",
      HU: "Melyik vegyület ismert rákkeltő a passzív dohányfüstben?",
    },
    options: {
      EN: ["Ammonia", "Formaldehyde", "Sodium chloride"],
      HU: ["Ammónia", "Formaldehid", "Nátrium-klorid"],
    },
    answer: 1,
    explanation: {
      EN: "Formaldehyde is a Group 1 carcinogen (IARC) found in high concentrations in sidestream smoke — the type you inhale passively.",
      HU: "A formaldehid az IARC szerint 1-es csoportú rákkeltő, és magas koncentrációban található a passzív dohányfüstben.",
    },
    tag: { EN: "Chemistry", HU: "Kémia" },
  },
  {
    question: {
      EN: "What is a common health effect of long-term secondhand smoke exposure?",
      HU: "Mi a passzív dohányzás hosszú távú egészségügyi hatása?",
    },
    options: {
      EN: [
        "Improved lung capacity",
        "Increased risk of heart disease",
        "Better immune response",
      ],
      HU: [
        "Javuló tüdőkapacitás",
        "Nőtt szívbetegség kockázat",
        "Erősebb immunválasz",
      ],
    },
    answer: 1,
    explanation: {
      EN: "Long-term exposure significantly elevates risk of heart disease, stroke, and lung cancer — even in non-smokers.",
      HU: "A hosszú távú kitettség jelentősen növeli a szívbetegség, a stroke és a tüdőrák kockázatát — még nemdohányzóknál is.",
    },
    tag: { EN: "Health Effects", HU: "Egészség" },
  },
  {
    question: {
      EN: "How many chemicals are found in tobacco smoke?",
      HU: "Hány vegyület található a dohányfüstben?",
    },
    options: {
      EN: ["Around 500", "Around 2,000", "Over 7,000"],
      HU: ["Kb. 500", "Kb. 2 000", "Több mint 7 000"],
    },
    answer: 2,
    explanation: {
      EN: "Tobacco smoke contains over 7,000 chemicals. At least 70 of these are known to cause cancer.",
      HU: "A dohányfüst több mint 7 000 vegyületet tartalmaz. Ezek közül legalább 70 rákkeltő.",
    },
    tag: { EN: "Data", HU: "Adatok" },
  },
  {
    question: {
      EN: "Which group is most vulnerable to secondhand smoke?",
      HU: "Melyik csoport a legérzékenyebb a passzív dohányzásra?",
    },
    options: {
      EN: ["Adults over 60", "Infants and young children", "Teenagers"],
      HU: [
        "60 év feletti felnőttek",
        "Csecsemők és kisgyermekek",
        "Tizenévesek",
      ],
    },
    answer: 1,
    explanation: {
      EN: "Children are especially vulnerable — their lungs are still developing and they breathe at faster rates, increasing chemical intake.",
      HU: "A gyermekek különösen érzékenyek — a tüdejük még fejlődik, és gyorsabban lélegeznek, így több vegyi anyagot szívnak be.",
    },
    tag: { EN: "Risk Groups", HU: "Kockázati csoportok" },
  },
  {
    question: {
      EN: "Which organ is most affected by secondhand smoke?",
      HU: "Melyik szervet érinti leginkább a passzív dohányzás?",
    },
    options: {
      EN: ["Heart", "Lungs", "Kidneys"],
      HU: ["Szív", "Tüdő", "Vesék"],
    },
    answer: 1,
    explanation: {
      EN: "The lungs are most directly affected, but secondhand smoke also increases risk for heart disease.",
      HU: "A tüdő a leginkább érintett, de a passzív dohányzás növeli a szívbetegségek kockázatát is.",
    },
    tag: { EN: "Organs", HU: "Szervek" },
  },
  {
    question: {
      EN: "What is a common symptom of secondhand smoke exposure in children?",
      HU: "Mi a passzív dohányzás gyakori tünete gyermekeknél?",
    },
    options: {
      EN: ["Frequent ear infections", "Improved appetite", "Faster growth"],
      HU: ["Gyakori fülgyulladás", "Javuló étvágy", "Gyorsabb növekedés"],
    },
    answer: 0,
    explanation: {
      EN: "Children exposed to secondhand smoke are more likely to suffer from ear infections and respiratory problems.",
      HU: "A passzív dohányzásnak kitett gyermekeknél gyakoribb a fülgyulladás és a légúti problémák.",
    },
    tag: { EN: "Symptoms", HU: "Tünetek" },
  },
  {
    question: {
      EN: "Which of these is NOT found in tobacco smoke?",
      HU: "Melyik NEM található meg a dohányfüstben?",
    },
    options: {
      EN: ["Arsenic", "Formaldehyde", "Vitamin C"],
      HU: ["Arzén", "Formaldehid", "C-vitamin"],
    },
    answer: 2,
    explanation: {
      EN: "Vitamin C is not present in tobacco smoke, but toxic chemicals like arsenic and formaldehyde are.",
      HU: "C-vitamin nincs a dohányfüstben, de mérgező vegyületek, mint az arzén és formaldehid, igen.",
    },
    tag: { EN: "Chemicals", HU: "Vegyületek" },
  },
  {
    question: {
      EN: "How quickly does secondhand smoke affect the body?",
      HU: "Milyen gyorsan hat a passzív dohányzás a szervezetre?",
    },
    options: {
      EN: ["Within minutes", "After several years", "Never"],
      HU: ["Perceken belül", "Több év után", "Sosem"],
    },
    answer: 0,
    explanation: {
      EN: "Even a few minutes of exposure can affect blood vessels and breathing.",
      HU: "Már néhány perc kitettség is hatással van az erekre és a légzésre.",
    },
    tag: { EN: "Effects", HU: "Hatások" },
  },
  {
    question: {
      EN: "What is the best way to protect against secondhand smoke?",
      HU: "Mi a legjobb módja a passzív dohányzás elleni védelemnek?",
    },
    options: {
      EN: [
        "Open windows",
        "Use air fresheners",
        "Create a smoke-free environment",
      ],
      HU: [
        "Ablaknyitás",
        "Légfrissítő használata",
        "Füstmentes környezet kialakítása",
      ],
    },
    answer: 2,
    explanation: {
      EN: "The only effective protection is to make your home and car completely smoke-free.",
      HU: "A leghatékonyabb védelem a teljesen füstmentes otthon és autó.",
    },
    tag: { EN: "Prevention", HU: "Megelőzés" },
  },
];

const OPTION_LETTERS = ["A", "B", "C"];

interface ScoreMessage {
  label: string;
  sub: string;
  color: string;
}

export default function QuizPage() {
  const [locale, setLocale] = useState<"EN" | "HU">("EN");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const scoreMessage = (score: number, total: number): ScoreMessage => {
    const pct = score / total;
    if (pct === 1)
      return {
        label: locale === "HU" ? "Tökéletes pontszám" : "Perfect Score",
        sub:
          locale === "HU"
            ? "Te vagy a passzív dohányzás szakértője."
            : "You're a secondhand smoke expert.",
        color: "#22c55e",
      };
    if (pct >= 0.6)
      return {
        label: locale === "HU" ? "Jól csináltad" : "Well Done",
        sub:
          locale === "HU"
            ? "Ismered a kockázatokat. Folytasd a tudatosság terjesztését."
            : "You know the risks. Keep spreading awareness.",
        color: "var(--amber)",
      };
    return {
      label: locale === "HU" ? "Ne add fel!" : "Don't Give Up!",
      sub:
        locale === "HU"
          ? "Minden megtanult tény megvédhet valakit."
          : "Every fact you learn could protect someone.",
      color: "var(--orange)",
    };
  };

  const q = questions[current];
  const progress = (current / questions.length) * 100;
  const isCorrect = selected === q.answer;

  interface Question {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
    tag: string;
  }

  interface Answer {
    selected: number | null;
    correct: boolean;
  }

  interface ScoreMessage {
    label: string;
    sub: string;
    color: string;
  }

  const handleOption = (idx: number): void => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const correct = selected === q.answer;
    const newScore = correct ? score + 1 : score;
    setAnswers([...answers, { selected, correct }]);
    if (current < questions.length - 1) {
      setScore(newScore);
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setScore(newScore);
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setAnswers([]);
  };

  const result = scoreMessage(score, questions.length);

  return (
    <>
      <FontLink />
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          fontFamily: "var(--sans)",
          color: "var(--white)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Background ── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
              animation: "gridPulse 5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "5%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(15,223,176,.09) 0%, transparent 70%)",
              animation: "orb1 20s ease-in-out infinite",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              right: "5%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(15,223,176,.06) 0%, transparent 70%)",
              animation: "orb2 24s ease-in-out infinite",
              filter: "blur(70px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 20%, var(--black) 100%)",
            }}
          />
        </div>

        {/* ── Nav bar ── */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "rgba(6,9,15,.88)",
            backdropFilter: "blur(18px)",
            borderBottom: "1px solid var(--border)",
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 54,
          }}
        >
          <a
            href="/"
            style={{
              textDecoration: "none",
              color: "var(--white)",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-.03em",
            }}
          >
            invisible<span style={{ color: "var(--teal)" }}>inhale</span>
          </a>
          <div style={{ display: "flex", gap: 8 }}>
            {/*             <button
              className="locale-btn"
              style={{
                background: locale === "EN" ? "var(--orange)" : "transparent",
                color: locale === "EN" ? "#fff" : "var(--muted)",
              }}
              onClick={() => {
                setLocale("EN");
                window.localStorage.setItem("locale", "EN");
              }}
            >
              EN
            </button>
            <button
              className="locale-btn"
              style={{
                background: locale === "HU" ? "var(--orange)" : "transparent",
                color: locale === "HU" ? "#fff" : "var(--muted)",
              }}
              onClick={() => {
                setLocale("HU");
                window.localStorage.setItem("locale", "HU");
              }}
            >
              HU
            </button> */}
          </div>
          <a href="/" className="back-btn">
            ← {locale === "HU" ? "Vissza a kezdőlapra" : "Back to Home"}
          </a>
        </nav>

        {/* ── Content ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 580,
          }}
        >
          {!showResult ? (
            <>
              {/* Header */}
              <div
                className="fade-up"
                style={{ textAlign: "center", marginBottom: 36 }}
              >
                <span
                  className="badge"
                  style={{ marginBottom: 16, display: "inline-flex" }}
                >
                  <span className="badge-dot" />
                  {locale === "HU"
                    ? `Kérdés ${current + 1} / ${questions.length}`
                    : `Question ${current + 1} of ${questions.length}`}
                </span>
                <h1
                  style={{
                    fontSize: "clamp(28px, 5vw, 42px)",
                    fontWeight: 800,
                    letterSpacing: "-.03em",
                    lineHeight: 1.1,
                  }}
                >
                  {locale === "HU" ? "Teszteld A" : "Test Your"}{" "}
                  <span
                    style={{
                      fontFamily: "var(--sans)",
                      fontStyle: "normal",
                      fontWeight: 700,
                      color: "var(--teal)",
                    }}
                  >
                    {locale === "HU" ? "Tudásod!" : "Knowledge!"}
                  </span>
                </h1>
              </div>

              {/* Progress bar */}
              <div className="fade-up d1" style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 4,
                        background:
                          i < current
                            ? "var(--teal)"
                            : i === current
                              ? "rgba(15,223,176,.35)"
                              : "var(--border)",
                        marginRight: i < questions.length - 1 ? 4 : 0,
                        transition: "background .4s",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                    }}
                  >
                    {q.tag[locale]}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                    }}
                  >
                    {current}/{questions.length}{" "}
                    {locale === "HU" ? "kérdés" : "questions"}
                  </span>
                </div>
              </div>

              {/* Quiz card */}
              <div
                className="quiz-card quiz-inner"
                key={current}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "24px",
                  boxShadow: "0 12px 32px rgba(0,0,0,.22)",
                }}
              >
                {/* Question */}
                <p
                  style={{
                    fontSize: "clamp(16px, 2.5vw, 19px)",
                    fontWeight: 700,
                    lineHeight: 1.5,
                    letterSpacing: "-.01em",
                    marginBottom: 24,
                  }}
                >
                  {q.question[locale]}
                </p>

                {/* Options */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  {q.options[locale].map((opt, idx) => {
                    let cls = "option-btn";
                    if (selected !== null) {
                      if (idx === q.answer) cls += " reveal-correct";
                      if (idx === selected && selected === q.answer)
                        cls = "option-btn selected-correct";
                      if (idx === selected && selected !== q.answer)
                        cls = "option-btn selected-wrong";
                    }
                    return (
                      <button
                        key={idx}
                        className={cls}
                        onClick={() => handleOption(idx)}
                        disabled={selected !== null}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            flexShrink: 0,
                            background:
                              selected !== null && idx === q.answer
                                ? "rgba(34,197,94,.2)"
                                : selected !== null &&
                                    idx === selected &&
                                    selected !== q.answer
                                  ? "rgba(239,68,68,.2)"
                                  : "rgba(255,255,255,.06)",
                            border: `1px solid ${
                              selected !== null && idx === q.answer
                                ? "rgba(34,197,94,.4)"
                                : selected !== null &&
                                    idx === selected &&
                                    selected !== q.answer
                                  ? "rgba(239,68,68,.4)"
                                  : "rgba(255,255,255,.1)"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--mono)",
                            fontSize: 11,
                            fontWeight: 600,
                            color:
                              selected !== null && idx === q.answer
                                ? "#22c55e"
                                : selected !== null &&
                                    idx === selected &&
                                    selected !== q.answer
                                  ? "#ef4444"
                                  : "var(--muted)",
                            transition: "all .2s",
                          }}
                        >
                          {OPTION_LETTERS[idx]}
                        </span>
                        <span>{opt}</span>
                        {selected !== null && idx === q.answer && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#22c55e",
                              fontSize: 16,
                            }}
                          >
                            ✓
                          </span>
                        )}
                        {selected !== null &&
                          idx === selected &&
                          selected !== q.answer && (
                            <span
                              style={{
                                marginLeft: "auto",
                                color: "#ef4444",
                                fontSize: 16,
                              }}
                            >
                              ✗
                            </span>
                          )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation + Next */}
                {selected !== null && (
                  <div style={{ animation: "fadeUp .4s ease both" }}>
                    <div
                      style={{
                        background: isCorrect
                          ? "rgba(34,197,94,.07)"
                          : "rgba(244,63,94,.08)",
                        border: `1px solid ${isCorrect ? "rgba(34,197,94,.2)" : "rgba(239,68,68,.2)"}`,
                        borderRadius: 8,
                        padding: "14px 16px",
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                          color: isCorrect ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {isCorrect
                          ? locale === "HU"
                            ? "✓ Helyes"
                            : "✓ Correct"
                          : locale === "HU"
                            ? "✗ Helytelen"
                            : "✗ Incorrect"}{" "}
                        — {locale === "HU" ? "Magyarázat" : "Explanation"}
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--white)",
                          lineHeight: 1.7,
                        }}
                      >
                        {q.explanation[locale]}
                      </p>
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <button className="next-btn" onClick={handleNext}>
                        {current < questions.length - 1
                          ? locale === "HU"
                            ? "Következő kérdés"
                            : "Next Question"
                          : locale === "HU"
                            ? "Eredmény megtekintése"
                            : "See Results"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Score tracker */}
              <div
                className="fade-up d4"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 20,
                }}
              >
                {answers.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: a.correct ? "#22c55e" : "#ef4444",
                    }}
                  />
                ))}
                {Array(questions.length - answers.length)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,.1)",
                      }}
                    />
                  ))}
              </div>
            </>
          ) : (
            /* ── Results ── */
            <div style={{ textAlign: "center" }}>
              <div className="fade-up" style={{ marginBottom: 12 }}>
                <span className="badge" style={{ display: "inline-flex" }}>
                  <span className="badge-dot" />
                  Quiz Complete
                </span>
              </div>

              {/* Score ring */}
              <div
                className="score-ring fade-up d1"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  margin: "24px auto 28px",
                  background: `conic-gradient(${result.color} ${(score / questions.length) * 360}deg, rgba(255,255,255,.06) 0deg)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 60px ${result.color}30`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "var(--bg)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      letterSpacing: "-.04em",
                      color: result.color,
                      lineHeight: 1,
                    }}
                  >
                    {score}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    / {questions.length}
                  </span>
                </div>
              </div>

              <h2
                className="fade-up d2"
                style={{
                  fontSize: "clamp(28px, 5vw, 42px)",
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: result.color,
                  }}
                >
                  {result.label}
                </span>
              </h2>
              <p
                className="fade-up d3"
                style={{
                  color: "var(--muted)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  maxWidth: 380,
                  margin: "0 auto 32px",
                }}
              >
                {result.sub}
              </p>

              {/* Per-question breakdown */}
              <div
                className="fade-up d3"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "18px 20px",
                  marginBottom: 28,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "var(--muted)",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Breakdown
                </div>
                {questions.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom:
                        i < questions.length - 1
                          ? "1px solid rgba(255,255,255,.05)"
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: answers[i]?.correct
                          ? "rgba(34,197,94,.15)"
                          : "rgba(239,68,68,.15)",
                        border: `1px solid ${answers[i]?.correct ? "rgba(34,197,94,.3)" : "rgba(239,68,68,.3)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: answers[i]?.correct ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {answers[i]?.correct ? "✓" : "✗"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--white)",
                        lineHeight: 1.4,
                        flex: 1,
                      }}
                    >
                      {q.question[locale]}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        color: answers[i]?.correct ? "#22c55e" : "#ef4444",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {q.tag[locale]}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="fade-up d4"
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button className="next-btn" onClick={handleRestart}>
                  {locale === "HU" ? "Újraindítás" : "Restart Quiz"}
                </button>
                <a href="/" className="back-btn">
                  {locale === "HU" ? "Vissza a főoldalra" : "Back to Home"}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
