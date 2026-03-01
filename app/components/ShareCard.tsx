"use client";
import React, { forwardRef } from "react";
import { CalcResult } from "../lib/smokeEngine";

interface ShareCardProps {
  result: CalcResult;
  years: number;
  cigsPerDay: number;
  isHU: boolean;
}

// This component is rendered off-screen and captured by html2canvas.
// Designed at 600×315px (2× = 1200×630 OG ratio). All styles inline,
// no external fonts loaded at capture time. Uses system-safe font stack.
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, years, cigsPerDay, isHU }, ref) => {
    const bio = result.biomarker;
    const bioColor =
      bio.interpretation === "background"
        ? "#4ade80"
        : bio.interpretation === "low"
          ? "#f59e0b"
          : bio.interpretation === "moderate"
            ? "#f97316"
            : "#ef4444";

    const topRisk = result.risks.reduce((a, b) =>
      a.rrIncrease > b.rrIncrease ? a : b,
    );

    const severityLabel = isHU
      ? bio.interpretation === "background"
        ? "Háttérszint"
        : bio.interpretation === "low"
          ? "Alacsony"
          : bio.interpretation === "moderate"
            ? "Mérsékelt"
            : "Magas"
      : bio.interpretation === "background"
        ? "Background"
        : bio.interpretation === "low"
          ? "Low"
          : bio.interpretation === "moderate"
            ? "Moderate"
            : "High";

    const whoPercent = ((result.avgPm25 / 15) * 100).toFixed(0);
    const lungRisk = result.risks.find((r) => r.condition === "Lung Cancer");

    // Card is 600×315 so when captured @2× = 1200×630 (standard OG image)
    return (
      <div
        ref={ref}
        style={{
          ["--color" as any]: "#f5f3ee",
          width: 600,
          height: 315,
          background: "#06060a",
          color: "var(--color)",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          flexShrink: 0,
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Orange orb top-left */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,92,26,.25) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* Red orb bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${bioColor}22 0%, transparent 70%)`,
            filter: "blur(24px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "28px 32px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Top row: logo + severity badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #ff5c1a, #ff9f50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                💨
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: "-.02em",
                }}
              >
                <span style={{ color: "var(--color)" }}>invisible</span>
                <span style={{ color: "#ff5c1a" }}>inhale</span>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: `${bioColor}18`,
                border: `1px solid ${bioColor}50`,
                borderRadius: 100,
                padding: "4px 12px",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: bioColor,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: bioColor,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                {severityLabel} {isHU ? "kitettség" : "exposure"}
              </span>
            </div>
          </div>

          {/* Main stat row */}
          <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            {/* Cotinine — biggest number */}
            <div
              style={{
                flex: "0 0 auto",
                background: "rgba(255,255,255,.04)",
                border: `1px solid ${bioColor}40`,
                borderLeft: `3px solid ${bioColor}`,
                borderRadius: "0 12px 12px 0",
                padding: "14px 20px",
                minWidth: 160,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--color)",
                  opacity: 0.4,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                🧬 {isHU ? "Szérum Kotinin" : "Serum Cotinine"}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontSize: 38,
                    fontWeight: 800,
                    color: bioColor,
                    letterSpacing: "-.04em",
                    lineHeight: 1,
                  }}
                >
                  {bio.serumNgMl.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color)",
                    opacity: 0.4,
                    fontWeight: 400,
                  }}
                >
                  ng/mL
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: bioColor,
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {isHU ? bio.label.HU : bio.label.EN}
              </div>
            </div>

            {/* Right stats grid */}
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {/* Equiv cigs */}
              <div
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.35,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  🚬 {isHU ? "Egyenértékű cig/nap" : "Equiv. cig/day"}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#ff5c1a",
                    letterSpacing: "-.03em",
                  }}
                >
                  {result.equivCigs.toFixed(3)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.3,
                    marginTop: 2,
                  }}
                >
                  PM₂.₅ basis
                </div>
              </div>

              {/* Pack-years */}
              <div
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.35,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  📦 {isHU ? "Csomag-évek" : "Pack-years"}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#ffb347",
                    letterSpacing: "-.03em",
                  }}
                >
                  {result.equivPackYears.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.3,
                    marginTop: 2,
                  }}
                >
                  {isHU ? "dohányos egyenértékű" : "smoker equivalent"}
                </div>
              </div>

              {/* PM2.5 */}
              <div
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.35,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  📊 PM₂.₅
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: result.peakPm25 > 150 ? "#ef4444" : "#f97316",
                    letterSpacing: "-.03em",
                  }}
                >
                  {result.peakPm25}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.3,
                    marginTop: 2,
                  }}
                >
                  μg/m³ · WHO: {whoPercent}%
                </div>
              </div>

              {/* Top risk */}
              <div
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.35,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  🫀 {isHU ? "Fő kockázat" : "Top risk"}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#ef4444",
                    letterSpacing: "-.03em",
                  }}
                >
                  ×{topRisk.rrIncrease.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color)",
                    opacity: 0.3,
                    marginTop: 2,
                  }}
                >
                  {isHU ? topRisk.conditionHU : topRisk.condition} RR
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: context + URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "var(--color)",
                opacity: 0.3,
                fontFamily: "'Courier New', monospace",
              }}
            >
              {years} {isHU ? "év kitettség" : "yrs exposure"} · {cigsPerDay}{" "}
              {isHU ? "cig/nap" : "cigs/day nearby"} ·{" "}
              {isHU ? "Tudományos modell" : "Science-backed model"}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color)",
                opacity: 0.25,
                fontFamily: "'Courier New', monospace",
                letterSpacing: ".04em",
              }}
            >
              invisibleinhale.com
            </div>
          </div>
        </div>

        {/* Subtle vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(6,6,10,.5) 100%)",
          }}
        />
      </div>
    );
  },
);

ShareCard.displayName = "ShareCard";
export default ShareCard;
