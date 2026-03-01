"use client";
import React, { useRef, useState, useCallback } from "react";
import ShareCard from "./ShareCard";
import { CalcResult } from "../lib/smokeEngine";

interface ShareModalProps {
  result: CalcResult;
  years: number;
  cigsPerDay: number;
  isHU: boolean;
  onClose: () => void;
}

type ShareStatus = "idle" | "capturing" | "copied" | "error";

export default function ShareModal({
  result,
  years,
  cigsPerDay,
  isHU,
  onClose,
}: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null);

  const capture = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      // Dynamically import html2canvas so it doesn't bloat initial bundle
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#06060a",
        logging: false,
        useCORS: true,
      });
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }, []);

  const handleCopy = async () => {
    setStatus("capturing");
    const dataUrl = imgDataUrl || (await capture());
    if (!dataUrl) {
      setStatus("error");
      return;
    }
    setImgDataUrl(dataUrl);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      // Fallback: open in new tab if clipboard API not supported
      const win = window.open();
      win?.document.write(`<img src="${dataUrl}" style="max-width:100%" />`);
      setStatus("idle");
    }
  };

  const handleDownload = async () => {
    setStatus("capturing");
    const dataUrl = imgDataUrl || (await capture());
    if (!dataUrl) {
      setStatus("error");
      return;
    }
    setImgDataUrl(dataUrl);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "my-shs-exposure.png";
    a.click();
    setStatus("idle");
  };

  const shareText = isHU
    ? `${years} év passzív dohányzás után a becsült kotininszintem ${result.biomarker.serumNgMl.toFixed(2)} ng/mL — ${result.biomarker.label.HU}. Ellenőrizd a saját kitettségedet:`
    : `After ${years} years of secondhand smoke exposure, my estimated cotinine level is ${result.biomarker.serumNgMl.toFixed(2)} ng/mL — ${result.biomarker.label.EN}. Check yours:`;
  const shareUrl = "https://invisibleinhale.com";

  const handleXShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
    window.open(url, "_blank");
  };

  const bio = result.biomarker;
  const bioColor =
    bio.interpretation === "background"
      ? "#4ade80"
      : bio.interpretation === "low"
        ? "#f59e0b"
        : bio.interpretation === "moderate"
          ? "#f97316"
          : "#ef4444";

  const buttonBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 20px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    border: "none",
    fontFamily: "var(--sans)",
    transition: "opacity .2s, transform .15s",
    letterSpacing: "-.01em",
  };

  const isCapturing = status === "capturing";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#0e0e14",
          border: "1px solid rgba(255,92,26,.25)",
          borderRadius: 24,
          padding: 32,
          maxWidth: 680,
          width: "100%",
          animation: "slideIn .3s ease",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,.06)",
            border: "none",
            borderRadius: 8,
            width: 32,
            height: 32,
            cursor: "pointer",
            color: "var(--color)",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--mono)",
              color: "var(--muted)",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            📤 {isHU ? "Megosztás" : "Share Your Results"}
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-.02em",
              marginBottom: 6,
            }}
          >
            {isHU ? "Mutasd meg másoknak" : "Show people what's really inside"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
            {isHU
              ? "Töltsd le vagy másold a kártyát — majd posztold közösségi médiában, hogy mások is ellenőrizhessék a saját kitettségüket."
              : "Download or copy your exposure card, then post it so others can check their own exposure."}
          </p>
        </div>

        {/* Card preview */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 24,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,.06)",
            // Scale down for preview
            transform: "scale(0.85)",
            transformOrigin: "top center",
            marginTop: -12,
          }}
        >
          <ShareCard
            ref={cardRef}
            result={result}
            years={years}
            cigsPerDay={cigsPerDay}
            isHU={isHU}
          />
        </div>

        {/* Status message */}
        {status === "copied" && (
          <div
            style={{
              background: "rgba(74,222,128,.1)",
              border: "1px solid rgba(74,222,128,.3)",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 16,
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "#4ade80",
              textAlign: "center",
            }}
          >
            ✓ {isHU ? "Kép másolva a vágólapra!" : "Image copied to clipboard!"}
          </div>
        )}
        {status === "error" && (
          <div
            style={{
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.3)",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 16,
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "#ef4444",
              textAlign: "center",
            }}
          >
            {isHU
              ? "Hiba a rögzítés során. Próbáld a letöltést."
              : "Capture failed. Try the download button instead."}
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 10,
          }}
        >
          {/* Copy image */}
          <button
            onClick={handleCopy}
            disabled={isCapturing}
            style={{
              ...buttonBase,
              background: isCapturing
                ? "rgba(255,255,255,.04)"
                : "var(--orange)",
              color: isCapturing ? "var(--muted)" : "var(--color)",
              opacity: isCapturing ? 0.7 : 1,
              flexDirection: "column",
              padding: "14px 12px",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>📋</span>
            <span style={{ fontSize: 11 }}>
              {status === "capturing"
                ? isHU
                  ? "Rögzítés..."
                  : "Capturing..."
                : isHU
                  ? "Kép másolása"
                  : "Copy Image"}
            </span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={isCapturing}
            style={{
              ...buttonBase,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "var(--color)",
              flexDirection: "column",
              padding: "14px 12px",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>💾</span>
            <span style={{ fontSize: 11 }}>
              {isHU ? "PNG letöltés" : "Download PNG"}
            </span>
          </button>

          {/* X / Twitter */}
          <button
            onClick={handleXShare}
            style={{
              ...buttonBase,
              background: "rgba(0,0,0,.6)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "var(--color)",
              flexDirection: "column",
              padding: "14px 12px",
              gap: 6,
            }}
          >
            <span
              style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace" }}
            >
              𝕏
            </span>
            <span style={{ fontSize: 11 }}>
              {isHU ? "Posztolás X-en" : "Post on X"}
            </span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            style={{
              ...buttonBase,
              background: "rgba(37,211,102,.08)",
              border: "1px solid rgba(37,211,102,.25)",
              color: "#25d366",
              flexDirection: "column",
              padding: "14px 12px",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            <span style={{ fontSize: 11 }}>WhatsApp</span>
          </button>
        </div>

        {/* Footer note */}
        <p
          style={{
            fontSize: 11,
            color: "var(--color)",
            opacity: 0.2,
            fontFamily: "var(--mono)",
            marginTop: 16,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {isHU
            ? "A kártya tartalmazza a becsült kotininszintet, az egyenértékű cigarettákat és a PM₂.₅ adatokat."
            : "Card includes estimated cotinine, equivalent cigarettes, and PM₂.₅ data. Educational use only."}
        </p>
      </div>
    </div>
  );
}
