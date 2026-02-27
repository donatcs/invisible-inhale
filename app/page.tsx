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

export default function SmokeTracker() {
  const [locale, setLocale] = useState("US");
  const costPerCig = locale === "US" ? 0.5 : 120;

  const t = {
    US: {
      calculatorTitle: "Personalized Secondhand Smoke Risk Calculator",
      dataCalculation: "Data & Calculation:",
      cigsPerDay: "Estimated Cigarettes/Day",
      householdSmokers: "Household Smokers",
      envSize: "Home/Environment Size (sq ft)",
      roomClean: "Is your room smoke-free?",
      totalCigs: "Total Passive Cigarettes",
      chemicalExposure: "Estimated Chemical Exposure",
      moneyWasted: "Money Wasted (USD)",
      basedOn: "Based on household average",
      howMany: "How many people smoke in your household?",
      largerSpaces: "Larger spaces dilute smoke exposure",
      smokeFree: "Smoke-free rooms reduce exposure",
      quiz: "Take the Quiz",
      yearsExposed: "Years Exposed",
      adjustYears:
        "Adjust the years exposed to see your personalized risk. More input options coming soon.",
      costTooltip:
        "Based on U.S. average cost per cigarette. Not affected by environment size.",
      downloadInfographic: "Download Infographic (Coming Soon)",
    },
    HU: {
      calculatorTitle:
        "Személyre szabott passzív dohányzás kockázat kalkulátor",
      dataCalculation: "Adatok & Számítás:",
      cigsPerDay: "Becsült cigaretták/nap",
      householdSmokers: "Dohányzó háztartásban",
      envSize: "Lakás/Élettér mérete (m²)",
      roomClean: "A szobád füstmentes?",
      totalCigs: "Összes passzív cigaretta",
      chemicalExposure: "Becsült vegyi anyag terhelés",
      moneyWasted: "Elpazarolt pénz (HUF)",
      basedOn: "Háztartási átlag alapján",
      howMany: "Hányan dohányoznak a háztartásban?",
      largerSpaces: "Nagyobb terek csökkentik a füst koncentrációját",
      smokeFree: "A füstmentes szobák csökkentik a kockázatot",
      quiz: "Töltsd ki a kvízt",
      yearsExposed: "Kitettség évei",
      adjustYears:
        "Állítsd be a kitettség éveit a személyre szabott kockázatért. További beállítások hamarosan.",
      costTooltip:
        "Magyarországi átlagos cigaretta ár alapján. Nem függ a környezet méretétől.",
      downloadInfographic: "Infografika letöltése (Hamarosan)",
    },
  } as const;

  const [modalOpen, setModalOpen] = useState(false);

  type ChemicalKey = keyof typeof chemicalDetails;
  const chemicalDetails = {
    Formaldehyde: {
      healthEffects: "Eye, nose, and throat irritation; increased cancer risk.",
      source: "CDC: https://www.cdc.gov/formaldehyde/",
      prevention: "Avoid exposure, ventilate spaces, use air purifiers.",
    },
    Benzene: {
      healthEffects: "Blood disorders, leukemia, immune system damage.",
      source: "CDC/NIOSH: https://www.cdc.gov/niosh/topics/benzene/",
      prevention: "Avoid smoke, use protective equipment in workplaces.",
    },
    Arsenic: {
      healthEffects: "Skin lesions, cancer, cardiovascular disease.",
      source: "WHO: https://www.who.int/news-room/fact-sheets/detail/arsenic",
      prevention: "Avoid contaminated sources, ensure clean water.",
    },
    Ammonia: {
      healthEffects: "Respiratory irritation, coughing, asthma aggravation.",
      source: "CDC/NIOSH: https://www.cdc.gov/niosh/topics/ammonia/",
      prevention: "Ventilate, avoid mixing with bleach, minimize exposure.",
    },
    "Polonium-210": {
      healthEffects: "Radiation poisoning, cancer risk.",
      source:
        "American Cancer Society: https://www.cancer.org/cancer/risk-prevention/tobacco/secondhand-smoke.html",
      prevention: "Avoid tobacco smoke, support smoke-free policies.",
    },
  };

  const [selectedChemical, setSelectedChemical] = useState<ChemicalKey | null>(
    null,
  );

  const YEARS_EXPOSED = 25;
  const DEFAULT_CIGS_PER_DAY_PASSIVE = 1.5;
  const DEFAULT_HOUSEHOLD_SMOKERS = 1;
  const DEFAULT_ENV_SIZE = 1000;
  const DEFAULT_ROOM_CLEAN = true;

  const [years, setYears] = useState(YEARS_EXPOSED);
  const [cigsPerDayPassive, setCigsPerDayPassive] = useState(
    DEFAULT_CIGS_PER_DAY_PASSIVE,
  );
  const [householdSmokers, setHouseholdSmokers] = useState(
    DEFAULT_HOUSEHOLD_SMOKERS,
  );
  const [envSize, setEnvSize] = useState(DEFAULT_ENV_SIZE);
  const [roomClean, setRoomClean] = useState(DEFAULT_ROOM_CLEAN);
  const [stats, setStats] = useState({
    totalCigs: 0,
    lungsImpact: 0,
    moneyWasted: 0,
  });

  useEffect(() => {
    let exposureFactor = 1;
    if (!roomClean) exposureFactor += 0.5;
    exposureFactor += (householdSmokers - 1) * 0.7;
    exposureFactor *= Math.max(0.5, 1000 / envSize);
    const total = years * 365 * cigsPerDayPassive * exposureFactor;
    const baselineCigs = years * 365 * cigsPerDayPassive;
    setStats({
      totalCigs: total,
      lungsImpact: total * 7000,
      moneyWasted: baselineCigs * costPerCig,
    });
  }, [
    years,
    cigsPerDayPassive,
    householdSmokers,
    envSize,
    roomClean,
    costPerCig,
  ]);

  const data = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    cigs: Math.round((i + 1) * 365 * cigsPerDayPassive),
  }));

  const currentT = t[locale as keyof typeof t];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950 text-zinc-100 p-8 font-sans relative overflow-hidden">
      {/* Smoke background effect */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 60%)," +
            "radial-gradient(circle at 70% 10%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 70%)," +
            "radial-gradient(circle at 60% 80%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Locale Switcher */}
      <div className="relative z-10 max-w-4xl mx-auto flex justify-end mb-4">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded px-3 py-2">
          <span className="text-xs text-zinc-400">🌎</span>
          <button
            className={`font-bold text-sm px-2 py-1 rounded ${locale === "US" ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-300"}`}
            onClick={() => setLocale("US")}
            aria-label="Switch to US"
          >
            US
          </button>
          <button
            className={`font-bold text-sm px-2 py-1 rounded ${locale === "HU" ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-300"}`}
            onClick={() => setLocale("HU")}
            aria-label="Switch to Hungary"
          >
            HU
          </button>
        </div>
      </div>

      <header className="relative z-10 max-w-4xl mx-auto mb-12 flex flex-col items-center gap-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-orange-500 uppercase drop-shadow-lg">
          <span role="img" aria-label="smoke" className="mr-2">
            🚬
          </span>
          {"The Invisible Inhale"}
        </h1>
        <p className="text-zinc-300 mt-4 text-xl md:text-2xl font-light">
          {locale === "HU"
            ? "A passzív dohányzás rejtett veszélyeinek feltárása."
            : "Unmasking the hidden dangers of second-hand smoke."}
        </p>
        <p className="text-orange-200 mt-2 text-lg font-medium">
          {locale === "HU" ? "Vizualizálva több mint " : "Visualizing "}
          <span className="font-bold">
            25+ {locale === "HU" ? "év" : "years"}
          </span>
          {locale === "HU"
            ? " kitettség, egészségügyi kockázatok és megelőzés."
            : " of exposure, health risks, and prevention."}
        </p>
        <a
          href="/quiz"
          className="inline-flex items-center mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded shadow-lg transition text-lg"
        >
          {currentT.quiz}
        </a>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interactive Risk Calculator */}
        <section className="md:col-span-3 mb-8 bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-lg">
          <h2 className="text-lg font-bold text-orange-500 mb-2">
            {currentT.calculatorTitle}
          </h2>
          <div className="mb-4 text-xs text-zinc-400 bg-black/20 rounded p-3">
            <strong>{currentT.dataCalculation}</strong>{" "}
            {locale === "US" ? (
              <>
                This calculator uses{" "}
                <span className="text-orange-400 font-semibold">
                  1.5 cigarettes/day
                </span>{" "}
                as a passive exposure estimate, based on the{" "}
                <a
                  className="underline text-blue-400"
                  href="https://www.hhs.gov/sites/default/files/secondhand-smoke-consumer.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2006 U.S. Surgeon General Report
                </a>{" "}
                and{" "}
                <a
                  className="underline text-blue-400"
                  href="https://www.ncbi.nlm.nih.gov/books/NBK316407/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IARC Monograph Vol. 83
                </a>
                . Each cigarette contains over{" "}
                <span className="text-yellow-400 font-semibold">
                  7,000 chemicals
                </span>
                . Cost is estimated at{" "}
                <span className="text-green-400 font-semibold">
                  $0.50 per cigarette
                </span>{" "}
                (U.S. average). Adjust the years to see your personalized risk.
              </>
            ) : (
              <>
                Ez a kalkulátor{" "}
                <span className="text-orange-400 font-semibold">
                  1,5 cigarettát/nap
                </span>{" "}
                használ passzív kitettség becslésére, a{" "}
                <a
                  className="underline text-blue-400"
                  href="https://www.hhs.gov/sites/default/files/secondhand-smoke-consumer.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2006-os U.S. Surgeon General Report
                </a>{" "}
                és{" "}
                <a
                  className="underline text-blue-400"
                  href="https://www.ncbi.nlm.nih.gov/books/NBK316407/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IARC Monograph Vol. 83
                </a>{" "}
                alapján. Egy cigaretta több mint{" "}
                <span className="text-yellow-400 font-semibold">
                  7 000 vegyi anyagot
                </span>{" "}
                tartalmaz. Az ár{" "}
                <span className="text-green-400 font-semibold">
                  60 Ft/cigaretta
                </span>{" "}
                (magyar átlag). Állítsd be a kitettség éveit a személyre szabott
                kockázatért.
              </>
            )}
          </div>

          <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label
                htmlFor="yearsExposed"
                className="block text-xs text-zinc-400 mb-1"
              >
                {currentT.yearsExposed}
              </label>
              <input
                id="yearsExposed"
                type="number"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full p-2 rounded border border-zinc-800 bg-zinc-950 text-zinc-100"
              />
            </div>
            <div>
              <label
                htmlFor="cigsPerDay"
                className="block text-xs text-zinc-400 mb-1"
              >
                {currentT.cigsPerDay}
              </label>
              <input
                id="cigsPerDay"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={cigsPerDayPassive}
                onChange={(e) => setCigsPerDayPassive(Number(e.target.value))}
                className="w-full p-2 rounded border border-zinc-800 bg-zinc-950 text-zinc-100"
              />
              <span className="text-xs text-zinc-500">
                ({currentT.basedOn})
              </span>
            </div>
            <div>
              <label
                htmlFor="householdSmokers"
                className="block text-xs text-zinc-400 mb-1"
              >
                {currentT.householdSmokers}
              </label>
              <input
                id="householdSmokers"
                type="number"
                min="1"
                max="10"
                value={householdSmokers}
                onChange={(e) => setHouseholdSmokers(Number(e.target.value))}
                className="w-full p-2 rounded border border-zinc-800 bg-zinc-950 text-zinc-100"
                placeholder="e.g. 2"
              />
              <span className="text-xs text-zinc-500">
                ({currentT.howMany})
              </span>
            </div>
            <div>
              <label
                htmlFor="envSize"
                className="block text-xs text-zinc-400 mb-1"
              >
                {currentT.envSize}
              </label>
              <input
                id="envSize"
                type="number"
                min="100"
                max="5000"
                value={envSize}
                onChange={(e) => setEnvSize(Number(e.target.value))}
                className="w-full p-2 rounded border border-zinc-800 bg-zinc-950 text-zinc-100"
                placeholder={locale === "US" ? "e.g. 1200" : "pl. 60"}
              />
              <span className="text-xs text-zinc-500">
                ({currentT.largerSpaces})
              </span>
            </div>
            <div>
              <label
                htmlFor="roomClean"
                className="block text-xs text-zinc-400 mb-1"
              >
                {currentT.roomClean}
              </label>
              <select
                id="roomClean"
                value={roomClean ? "yes" : "no"}
                onChange={(e) => setRoomClean(e.target.value === "yes")}
                className="w-full p-2 rounded border border-zinc-800 bg-zinc-950 text-zinc-100"
              >
                <option value="yes">{locale === "US" ? "Yes" : "Igen"}</option>
                <option value="no">{locale === "US" ? "No" : "Nem"}</option>
              </select>
              <span className="text-xs text-zinc-500">
                ({currentT.smokeFree})
              </span>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-black/30 rounded p-4 border border-zinc-800 group relative">
              <h3 className="text-xs text-zinc-400 mb-2">
                {currentT.totalCigs}
              </h3>
              <p className="text-2xl font-bold text-orange-500">
                {stats.totalCigs.toLocaleString()}
              </p>
              <span className="absolute left-1/2 -translate-x-1/2 top-0 mt-8 z-20 hidden group-hover:block bg-zinc-800 text-xs text-zinc-200 rounded px-3 py-2 shadow-lg border border-zinc-700 w-64">
                Calculated as: <br />
                <span className="font-mono">
                  years × 365 × cigarettes/day × exposure factor
                </span>
                <br />
                Exposure factor considers household smokers, environment size,
                and room smoke-free status.
              </span>
            </div>
            <div className="bg-black/30 rounded p-4 border border-zinc-800 group relative">
              <h3 className="text-xs text-zinc-400 mb-2">
                {currentT.chemicalExposure}
              </h3>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.lungsImpact.toLocaleString()}
              </p>
              <span className="absolute left-1/2 -translate-x-1/2 top-0 mt-8 z-20 hidden group-hover:block bg-zinc-800 text-xs text-zinc-200 rounded px-3 py-2 shadow-lg border border-zinc-700 w-64">
                Calculated as: <br />
                <span className="font-mono">
                  Total Passive Cigarettes × 7,000
                </span>
                <br />
                Each cigarette contains over 7,000 chemicals.
              </span>
            </div>
            <div className="bg-black/30 rounded p-4 border border-zinc-800 group relative">
              <h3 className="text-xs text-zinc-400 mb-2">
                {currentT.moneyWasted}
              </h3>
              <p className="text-2xl font-bold text-green-400">
                {locale === "US" ? "$" : ""}
                {stats.moneyWasted.toLocaleString()}
                {locale === "HU" ? " Ft" : ""}
              </p>
              <span className="absolute left-1/2 -translate-x-1/2 top-0 mt-8 z-20 hidden group-hover:block bg-zinc-800 text-xs text-zinc-200 rounded px-3 py-2 shadow-lg border border-zinc-700 w-64">
                {currentT.costTooltip}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-500">{currentT.adjustYears}</p>
        </section>

        {/* Duration Slider */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-4">
            {locale === "HU" ? "Időtartam" : "Duration"}
          </h2>
          <input
            type="range"
            min="1"
            max="50"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <p className="text-3xl font-bold mt-4">
            {years}{" "}
            <span className="text-sm font-normal text-zinc-500">Years</span>
          </p>
        </div>

        {/* Big Stat 1 */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-2">
            {locale === "HU" ? "Passzív cigaretták" : "Passive Cigarettes"}
          </h2>
          <p className="text-4xl font-black text-orange-600 tracking-tight">
            {stats.totalCigs.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Total inhaled involuntarily.
          </p>
        </div>

        {/* Big Stat 2 */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-2">
            {locale === "HU" ? "Toxin terhelés" : "Toxin Exposure"}
          </h2>
          <p className="text-4xl font-black text-yellow-600 tracking-tight">
            7,000+
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Chemicals processed by your lungs.
          </p>
        </div>

        {/* Chart Section */}
        <div className="md:col-span-3 bg-zinc-900 p-8 rounded-xl border border-zinc-800 h-80">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-6">
            {locale === "HU"
              ? "Összesített belégzés az idő során"
              : "Cumulative Inhalation Over Time"}
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                stroke="#52525b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#52525b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#ea580c" }}
              />
              <Area
                type="monotone"
                dataKey="cigs"
                stroke="#ea580c"
                fillOpacity={1}
                fill="url(#colorCig)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Toxin Table Section */}
        <div className="md:col-span-3 mt-8 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase">
              The Chemical Payload
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Found in sidestream smoke (higher concentrations than inhaled
              smoke)
            </p>
          </div>
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400">
                <th className="p-4">Chemical</th>
                <th className="p-4">Common Use</th>
                <th className="p-4 text-orange-500 text-right">Toxicity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(
                [
                  "Formaldehyde",
                  "Benzene",
                  "Arsenic",
                  "Ammonia",
                  "Polonium-210",
                ] as ChemicalKey[]
              ).map((chem) => {
                const uses: Record<ChemicalKey, string> = {
                  Formaldehyde: "Embalming fluid",
                  Benzene: "Gasoline additive",
                  Arsenic: "Rat poison",
                  Ammonia: "Toilet cleaner",
                  "Polonium-210": "Radioactive element",
                };
                const toxicity: Record<
                  ChemicalKey,
                  { label: string; className: string }
                > = {
                  Formaldehyde: { label: "Carcinogen", className: "" },
                  Benzene: { label: "High", className: "text-orange-400" },
                  Arsenic: { label: "Lethal", className: "text-red-500" },
                  Ammonia: { label: "Irritant", className: "" },
                  "Polonium-210": {
                    label: "Radioactive",
                    className:
                      "text-red-600 font-black italic underline animate-pulse",
                  },
                };
                return (
                  <tr
                    key={chem}
                    className={
                      chem === "Polonium-210" ? "bg-orange-950/20" : ""
                    }
                  >
                    <td
                      className="p-4 font-bold cursor-pointer hover:underline text-blue-400"
                      onClick={() => {
                        setSelectedChemical(chem);
                        setModalOpen(true);
                      }}
                    >
                      {chem}
                    </td>
                    <td className="p-4 text-zinc-500 text-xs text-wrap">
                      {uses[chem]}
                    </td>
                    <td
                      className={`p-4 text-right ${toxicity[chem].className}`}
                    >
                      {toxicity[chem].label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Chemical Info Modal */}
      {modalOpen && selectedChemical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-zinc-400 hover:text-orange-500 text-xl font-bold"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold text-orange-500 mb-2">
              {selectedChemical}
            </h2>
            <div className="mb-2 text-zinc-200 text-sm">
              <strong>Health Effects:</strong>{" "}
              {chemicalDetails[selectedChemical].healthEffects}
            </div>
            <div className="mb-2 text-zinc-200 text-sm">
              <strong>Source:</strong>{" "}
              <a
                href={chemicalDetails[selectedChemical].source.split(": ")[1]}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400"
              >
                {chemicalDetails[selectedChemical].source.split(": ")[0]}
              </a>
            </div>
            <div className="mb-2 text-zinc-200 text-sm">
              <strong>Prevention:</strong>{" "}
              {chemicalDetails[selectedChemical].prevention}
            </div>
          </div>
        </div>
      )}

      {/* Visual Comparison Chart */}
      <section className="max-w-4xl mx-auto mt-12 mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          Secondhand Smoke vs. Other Environmental Risks
        </h2>
        <div className="w-full h-64">
          <p className="text-zinc-400 text-sm">
            {locale === "HU"
              ? "Összehasonlító diagram hamarosan: passzív dohányzás, légszennyezés, radon stb."
              : "Comparison chart coming soon: secondhand smoke, air pollution, radon, etc."}
          </p>
        </div>
      </section>

      {/* Health Effects Timeline */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          {locale === "HU"
            ? "Egészségügyi hatások az idő során"
            : "Health Effects Over Time"}
        </h2>
        <ul className="list-none pl-0 text-sm text-zinc-400 space-y-2">
          {locale === "HU" ? (
            <>
              <li>
                <span className="font-bold text-zinc-200">1. év:</span> Növekvő
                légúti fertőzés kockázat
              </li>
              <li>
                <span className="font-bold text-zinc-200">5. év:</span> Krónikus
                köhögés, asztma tünetek
              </li>
              <li>
                <span className="font-bold text-zinc-200">10. év:</span>{" "}
                Emelkedett szívbetegség kockázat
              </li>
              <li>
                <span className="font-bold text-zinc-200">20+ év:</span>{" "}
                Magasabb tüdőrák, stroke kockázat
              </li>
            </>
          ) : (
            <>
              <li>
                <span className="font-bold text-zinc-200">Year 1:</span>{" "}
                Increased risk of respiratory infections
              </li>
              <li>
                <span className="font-bold text-zinc-200">Year 5:</span> Chronic
                cough, asthma symptoms
              </li>
              <li>
                <span className="font-bold text-zinc-200">Year 10:</span>{" "}
                Elevated risk of heart disease
              </li>
              <li>
                <span className="font-bold text-zinc-200">Year 20+:</span>{" "}
                Higher risk of lung cancer, stroke
              </li>
            </>
          )}
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          {locale === "HU"
            ? "Gyakran Ismételt Kérdések"
            : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4 text-sm text-zinc-400">
          {locale === "HU" ? (
            <>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Valóban veszélyes a passzív dohányzás?
                </h3>
                <p>
                  Igen. Nincs biztonságos szintje a kitettségnek. Több ezer
                  vegyi anyagot tartalmaz, melyek közül sok mérgező vagy
                  rákkeltő.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Eltávolítható-e a füst légtisztítóval?
                </h3>
                <p>
                  A légtisztítók csökkenthetik néhány részecskét, de nem
                  távolítják el az összes toxint vagy gázt a dohányfüstből.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Hogyan védhetem meg a családomat?
                </h3>
                <p>
                  Tedd füstmentessé otthonod és autód, bátorítsd a dohányzókat a
                  leszokásra, és kerüld a dohányzó helyeket.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Is secondhand smoke really dangerous?
                </h3>
                <p>
                  Yes. There is no safe level of exposure. It contains thousands
                  of chemicals, many of which are toxic or carcinogenic.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Can air purifiers eliminate secondhand smoke?
                </h3>
                <p>
                  Air purifiers may reduce some particles, but cannot remove all
                  toxins or gases from tobacco smoke.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  What are the best ways to protect my family?
                </h3>
                <p>
                  Make your home and car smoke-free, encourage smokers to quit,
                  and avoid places where smoking occurs.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action Resources */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          {locale === "HU" ? "Tegyél lépéseket" : "Take Action"}
        </h2>
        <ul className="list-disc pl-6 text-sm text-zinc-400 space-y-2">
          {locale === "HU" ? (
            <>
              <li>
                <a
                  href="https://smokefree.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Smokefree.gov — Ingyenes leszokási források
                </a>
              </li>
              <li>
                <a
                  href="https://www.lung.org/quit-smoking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  American Lung Association — Leszokás támogatás
                </a>
              </li>
              <li>
                <a
                  href="https://www.tobaccofreekids.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Campaign for Tobacco-Free Kids — Gyermekek védelme
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <a
                  href="https://smokefree.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Smokefree.gov — Free quit resources
                </a>
              </li>
              <li>
                <a
                  href="https://www.lung.org/quit-smoking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  American Lung Association — Quit Smoking
                </a>
              </li>
              <li>
                <a
                  href="https://www.tobaccofreekids.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Campaign for Tobacco-Free Kids
                </a>
              </li>
            </>
          )}
        </ul>
      </section>

      {/* Policy & Advocacy Info */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          {locale === "HU" ? "Politika & Érdekképviselet" : "Policy & Advocacy"}
        </h2>
        <ul className="list-disc pl-6 text-sm text-zinc-400 space-y-1">
          {locale === "HU" ? (
            <>
              <li>Támogasd a füstmentes törvényeket a közösségedben</li>
              <li>Állj ki a tiszta levegőért az iskolákban és munkahelyeken</li>
              <li>Oszd meg az oktatási forrásokat másokkal</li>
            </>
          ) : (
            <>
              <li>Support smoke-free laws in your community</li>
              <li>Advocate for clean air in schools and workplaces</li>
              <li>Share educational resources with others</li>
            </>
          )}
        </ul>
        <p className="text-xs text-zinc-500 mt-2">
          {locale === "HU" ? "További információ: " : "Learn more at "}
          <a
            href="https://www.tobaccofreekids.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            Campaign for Tobacco-Free Kids
          </a>
          .
        </p>
      </section>

      {/* Scientific Methodology */}
      <section className="max-w-4xl mx-auto mt-16 p-6 border-l-4 border-orange-600 bg-zinc-900/50 rounded-r-xl">
        <h3 className="text-xl font-bold text-zinc-200 mb-4 tracking-tight">
          {locale === "HU" ? "Tudományos módszertan" : "Scientific Methodology"}
        </h3>
        <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-200">
              {locale === "HU"
                ? '"Cigaretta-egyenértékű" számítás:'
                : 'The "Cigarette Equivalent" Calculation:'}
            </strong>{" "}
            {locale === "HU"
              ? "A 2006-os Surgeon General jelentés alapján nincs biztonságos kitettségi szint. Modellünk konzervatív becslést használ: napi 1,5 cigaretta azok számára, akik magas kitettségű háztartásban élnek, a lakóhelyeken mért átlagos PM₂.₅ koncentrációk alapján (kb. 70–150 μg/m³)."
              : "Based on the 2006 Surgeon General's Report, there is no safe level of exposure. Our model uses a conservative estimate of 1.5 cigarettes/day for individuals living in a high-exposure household, based on mean PM₂.₅ concentrations observed in residential settings (approx. 70–150 μg/m³)."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 font-mono text-xs">
            <div className="p-3 bg-black/40 rounded border border-zinc-800">
              <p className="text-zinc-500 mb-1 uppercase tracking-widest">
                [Source 01]
              </p>
              <p>
                {locale === "HU"
                  ? 'U.S. Egészségügyi és Humán Szolgáltatások Minisztériuma. "A dohányfüstnek való akaratlan kitettség egészségügyi következményei: A Surgeon General jelentése."'
                  : 'U.S. Dept. of Health and Human Services. "The Health Consequences of Involuntary Exposure to Tobacco Smoke: A Report of the Surgeon General."'}
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded border border-zinc-800">
              <p className="text-zinc-500 mb-1 uppercase tracking-widest">
                [Source 02]
              </p>
              <p>
                {locale === "HU"
                  ? 'Nemzetközi Rákkutató Ügynökség (IARC). "Monográfia 83. kötet: Dohányfüst és akaratlan dohányzás."'
                  : 'International Agency for Research on Cancer (IARC). "Monograph Volume 83: Tobacco Smoke and Involuntary Smoking."'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto mt-20 pb-12 text-zinc-500 border-t border-zinc-800 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-zinc-300 font-bold mb-2 uppercase text-xs tracking-widest">
              {locale === "HU" ? "Adatforrások" : "Data Sources"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                •{" "}
                <a
                  href="https://www.hhs.gov/sites/default/files/secondhand-smoke-consumer.pdf"
                  target="_blank"
                  className="underline hover:text-orange-500"
                >
                  {locale === "HU"
                    ? "U.S. Surgeon General jelentés (2006)"
                    : "U.S. Surgeon General Report (2006)"}
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="https://www.who.int/news-room/fact-sheets/detail/tobacco"
                  target="_blank"
                  className="underline hover:text-orange-500"
                >
                  {locale === "HU"
                    ? "WHO: Dohányzás & Egészség adatlap"
                    : "WHO: Tobacco & Health Fact Sheet"}
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="https://www.ncbi.nlm.nih.gov/books/NBK316407/"
                  target="_blank"
                  className="underline hover:text-orange-500"
                >
                  {locale === "HU"
                    ? "IARC Monográfia 83. kötet (Dohányfüst)"
                    : "IARC Monograph Vol. 83 (Tobacco Smoke)"}
                </a>
              </li>
            </ul>
          </div>
          <div className="text-xs leading-relaxed">
            <h4 className="text-zinc-300 font-bold mb-2 uppercase text-xs tracking-widest">
              {locale === "HU" ? "Figyelmeztetés" : "Disclaimer"}
            </h4>
            <p>
              {locale === "HU"
                ? "Ez a vizualizáció oktatási célú eszköz, amely bevált közegészségügyi proxykra épül. Személyre szabott egészségügyi értékeléshez fordulj orvoshoz a hosszú távú légzőszervi kitettség kapcsán."
                : "This visualization is an educational tool based on established public health proxies. For a personalized health assessment, please consult a medical professional regarding long-term respiratory exposure."}
            </p>
          </div>
        </div>
      </footer>

      <footer className="max-w-4xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-zinc-600 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Invisible Inhale: Explore the Impact
          of Second-Hand Smoke
        </p>
      </footer>
    </div>
  );
}
