"use client";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function SmokeTracker() {
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
  // Constants based on environmental health studies
  const CIGS_PER_DAY_PASSIVE = 1.5;
  const YEARS_EXPOSED = 25;

  const [years, setYears] = useState(YEARS_EXPOSED);
  const [stats, setStats] = useState({
    totalCigs: 0,
    lungsImpact: 0,
    moneyWasted: 0,
  });

  useEffect(() => {
    const total = years * 365 * CIGS_PER_DAY_PASSIVE;
    setStats({
      totalCigs: total,
      lungsImpact: total * 7000, // Approximate number of chemicals processed
      moneyWasted: total * 0.5, // Assuming $0.50 per cigarette
    });
  }, [years]);

  // Mock data for the chart
  const data = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    cigs: Math.round((i + 1) * 365 * CIGS_PER_DAY_PASSIVE),
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tighter text-orange-500 uppercase">
          The Invisible Inhale
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Visualizing 25+ years of secondhand smoke exposure.
        </p>
        <a
          href="/quiz"
          className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded shadow transition"
        >
          Take the Quiz
        </a>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interactive Risk Calculator */}
        <section className="md:col-span-3 mb-8 bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-lg">
          <h2 className="text-lg font-bold text-orange-500 mb-2">
            Personalized Secondhand Smoke Risk Calculator
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label
                htmlFor="yearsExposed"
                className="block text-xs text-zinc-400 mb-1"
              >
                Years Exposed
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
                Estimated Cigarettes/Day
              </label>
              <input
                id="cigsPerDay"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={CIGS_PER_DAY_PASSIVE}
                onChange={(e) => {
                  /* Optionally implement adjustable CIGS_PER_DAY_PASSIVE */
                }}
                className="w-full p-2 rounded border border-zinc-800 bg-zinc-950 text-zinc-100"
                disabled
              />
              <span className="text-xs text-zinc-500">
                (Based on household average)
              </span>
            </div>
            <div>
              <label
                htmlFor="householdSmokers"
                className="block text-xs text-zinc-400 mb-1"
              >
                Household Smokers
              </label>
              <input
                id="householdSmokers"
                type="number"
                min="0"
                max="10"
                className="w-full p-2 rounded border border-zinc-800 bg-zinc-950 text-zinc-100"
                placeholder="e.g. 2"
                disabled
              />
              <span className="text-xs text-zinc-500">
                (Feature coming soon)
              </span>
            </div>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded p-4 border border-zinc-800">
              <h3 className="text-xs text-zinc-400 mb-2">
                Total Passive Cigarettes
              </h3>
              <p className="text-2xl font-bold text-orange-500">
                {stats.totalCigs.toLocaleString()}
              </p>
            </div>
            <div className="bg-black/30 rounded p-4 border border-zinc-800">
              <h3 className="text-xs text-zinc-400 mb-2">
                Estimated Chemical Exposure
              </h3>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.lungsImpact.toLocaleString()}
              </p>
            </div>
            <div className="bg-black/30 rounded p-4 border border-zinc-800">
              <h3 className="text-xs text-zinc-400 mb-2">Money Wasted (USD)</h3>
              <p className="text-2xl font-bold text-green-400">
                ${stats.moneyWasted.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Adjust the years exposed to see your personalized risk. More input
            options coming soon.
          </p>
        </section>
        {/* Input Card */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-4">
            Duration
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
            Passive Cigarettes
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
            Toxin Exposure
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
            Cumulative Inhalation Over Time
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
              <tr>
                <td
                  className="p-4 font-bold cursor-pointer hover:underline text-blue-400"
                  onClick={() => {
                    setSelectedChemical("Formaldehyde");
                    setModalOpen(true);
                  }}
                >
                  Formaldehyde
                </td>
                <td className="p-4 text-zinc-500 text-xs text-wrap">
                  Embalming fluid
                </td>
                <td className="p-4 text-right">Carcinogen</td>
              </tr>
              <tr>
                <td
                  className="p-4 font-bold cursor-pointer hover:underline text-blue-400"
                  onClick={() => {
                    setSelectedChemical("Benzene");
                    setModalOpen(true);
                  }}
                >
                  Benzene
                </td>
                <td className="p-4 text-zinc-500 text-xs text-wrap">
                  Gasoline additive
                </td>
                <td className="p-4 text-right text-orange-400">High</td>
              </tr>
              <tr>
                <td
                  className="p-4 font-bold cursor-pointer hover:underline text-blue-400"
                  onClick={() => {
                    setSelectedChemical("Arsenic");
                    setModalOpen(true);
                  }}
                >
                  Arsenic
                </td>
                <td className="p-4 text-zinc-500 text-xs text-wrap">
                  Rat poison
                </td>
                <td className="p-4 text-right text-red-500">Lethal</td>
              </tr>
              <tr>
                <td
                  className="p-4 font-bold cursor-pointer hover:underline text-blue-400"
                  onClick={() => {
                    setSelectedChemical("Ammonia");
                    setModalOpen(true);
                  }}
                >
                  Ammonia
                </td>
                <td className="p-4 text-zinc-500 text-xs text-wrap">
                  Toilet cleaner
                </td>
                <td className="p-4 text-right">Irritant</td>
              </tr>
              <tr className="bg-orange-950/20">
                <td
                  className="p-4 font-bold cursor-pointer hover:underline text-blue-400"
                  onClick={() => {
                    setSelectedChemical("Polonium-210");
                    setModalOpen(true);
                  }}
                >
                  Polonium-210
                </td>
                <td className="p-4 text-zinc-500 text-xs text-wrap">
                  Radioactive element
                </td>
                <td className="p-4 text-right text-red-600 font-black italic underline animate-pulse">
                  Radioactive
                </td>
              </tr>
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
            <h2 className="text-xl font-bold text-orange-500 mb-2">
              {selectedChemical}
            </h2>
            <div className="mb-2 text-zinc-200 text-sm">
              <strong>Health Effects:</strong>{" "}
              {chemicalDetails[selectedChemical].healthEffects}
            </div>
            <div className="mb-2 text-zinc-200 text-sm">
              <strong>Source:</strong>{" "}
              <a
                href={
                  selectedChemical
                    ? chemicalDetails[selectedChemical].source.split(": ")[1]
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400"
              >
                {selectedChemical
                  ? chemicalDetails[selectedChemical].source.split(": ")[0]
                  : ""}
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
          {/* Placeholder for comparison chart, e.g., BarChart from recharts */}
          <p className="text-zinc-400 text-sm">
            Comparison chart coming soon: secondhand smoke, air pollution,
            radon, etc.
          </p>
        </div>
      </section>

      {/* Health Effects Timeline */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          Health Effects Over Time
        </h2>
        <ul className="timeline list-none pl-0 text-sm text-zinc-400">
          <li>
            <span className="font-bold text-zinc-200">Year 1:</span> Increased
            risk of respiratory infections
          </li>
          <li>
            <span className="font-bold text-zinc-200">Year 5:</span> Chronic
            cough, asthma symptoms
          </li>
          <li>
            <span className="font-bold text-zinc-200">Year 10:</span> Elevated
            risk of heart disease
          </li>
          <li>
            <span className="font-bold text-zinc-200">Year 20+:</span> Higher
            risk of lung cancer, stroke
          </li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 text-sm text-zinc-400">
          <div>
            <h3 className="font-semibold text-zinc-200">
              Is secondhand smoke really dangerous?
            </h3>
            <p>
              Yes. There is no safe level of exposure. It contains thousands of
              chemicals, many of which are toxic or carcinogenic.
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
              Make your home and car smoke-free, encourage smokers to quit, and
              avoid places where smoking occurs.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Resources */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">Take Action</h2>
        <ul className="list-disc pl-6 text-sm text-zinc-400">
          <li>
            <a
              href="https://smokefree.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400"
            >
              Smokefree.gov
            </a>{" "}
            - Resources for quitting smoking
          </li>
          <li>
            <a
              href="https://www.cdc.gov/tobacco/quit_smoking/index.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400"
            >
              CDC Quit Smoking
            </a>{" "}
            - Support and information
          </li>
          <li>
            <a
              href="https://www.lung.org/quit-smoking"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400"
            >
              American Lung Association
            </a>{" "}
            - Help for families
          </li>
        </ul>
      </section>

      {/* Shareable Infographic Feature */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          Share This Visualization
        </h2>
        <p className="text-sm text-zinc-400 mb-2">
          Download or share a summary infographic of your results.
        </p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
          Download Infographic (Coming Soon)
        </button>
      </section>

      {/* Accessibility Improvements Notice */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          Accessibility & Inclusion
        </h2>
        <ul className="list-disc pl-6 text-sm text-zinc-400">
          <li>Alt text for all images and charts</li>
          <li>High color contrast for readability</li>
          <li>ARIA labels for interactive elements</li>
          <li>Keyboard navigation support</li>
        </ul>
        <p className="text-xs text-zinc-500 mt-2">
          If you have accessibility feedback, please contact us.
        </p>
      </section>

      {/* More Data Visualizations */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          Explore More Data
        </h2>
        <p className="text-sm text-zinc-400 mb-2">
          Additional charts and visualizations coming soon.
        </p>
      </section>

      {/* Testimonials or Stories */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">Real Stories</h2>
        <blockquote className="border-l-4 border-orange-500 pl-4 italic text-zinc-300 mb-2">
          "Secondhand smoke made my childhood asthma much worse. I wish my
          parents had known the risks."
        </blockquote>
        <blockquote className="border-l-4 border-orange-500 pl-4 italic text-zinc-300">
          "After going smoke-free, my family's health improved dramatically."
        </blockquote>
      </section>

      {/* Policy & Advocacy Info */}
      <section className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500 mb-4">
          Policy & Advocacy
        </h2>
        <ul className="list-disc pl-6 text-sm text-zinc-400">
          <li>Support smoke-free laws in your community</li>
          <li>Advocate for clean air in schools and workplaces</li>
          <li>Share educational resources with others</li>
        </ul>
        <p className="text-xs text-zinc-500 mt-2">
          Learn more at{" "}
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
      <section className="max-w-4xl mx-auto mt-16 p-6 border-l-4 border-orange-600 bg-zinc-900/50 rounded-r-xl">
        <h3 className="text-xl font-bold text-zinc-200 mb-4 tracking-tight">
          Scientific Methodology
        </h3>
        <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-200">
              The "Cigarette Equivalent" Calculation:
            </strong>{" "}
            Based on the
            <em> 2006 Surgeon General’s Report</em>, there is no safe level of
            exposure. Our model uses a conservative estimate of{" "}
            <span className="text-orange-500">1.5 cigarettes/day</span> for
            individuals living in a high-exposure household, based on mean $PM_
            {2.5}$ concentrations observed in residential settings (approx.
            70-150 $\mu g/m^3$).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 font-mono text-xs">
            <div className="p-3 bg-black/40 rounded border border-zinc-800">
              <p className="text-zinc-500 mb-1 uppercase tracking-widest">
                [Source 01]
              </p>
              <p>
                U.S. Dept. of Health and Human Services. "The Health
                Consequences of Involuntary Exposure to Tobacco Smoke: A Report
                of the Surgeon General."
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded border border-zinc-800">
              <p className="text-zinc-500 mb-1 uppercase tracking-widest">
                [Source 02]
              </p>
              <p>
                International Agency for Research on Cancer (IARC). "Monograph
                Volume 83: Tobacco Smoke and Involuntary Smoking."
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto mt-20 pb-12 text-zinc-500 border-t border-zinc-800 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-zinc-300 font-bold mb-2 uppercase text-xs tracking-widest">
              Data Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                •{" "}
                <a
                  href="https://www.hhs.gov/sites/default/files/secondhand-smoke-consumer.pdf"
                  target="_blank"
                  className="underline hover:text-orange-500"
                >
                  U.S. Surgeon General Report (2006)
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="https://www.who.int/news-room/fact-sheets/detail/tobacco"
                  target="_blank"
                  className="underline hover:text-orange-500"
                >
                  WHO: Tobacco & Health Fact Sheet
                </a>
              </li>
              <li>
                •{" "}
                <a
                  href="https://www.ncbi.nlm.nih.gov/books/NBK316407/"
                  target="_blank"
                  className="underline hover:text-orange-500"
                >
                  IARC Monograph Vol. 83 (Tobacco Smoke)
                </a>
              </li>
            </ul>
          </div>
          <div className="text-xs leading-relaxed">
            <h4 className="text-zinc-300 font-bold mb-2 uppercase text-xs tracking-widest">
              Disclaimer
            </h4>
            <p>
              This visualization is an educational tool based on established
              public health proxies. For a personalized health assessment,
              please consult a medical professional regarding long-term
              respiratory exposure.
            </p>
          </div>
        </div>
      </footer>

      <footer className="max-w-4xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-zinc-600 text-sm">
        <p>
          This is a data visualization based on my 25 years of lived experience.
          Secondhand smoke is an invisible burden.
        </p>
      </footer>
    </div>
  );
}
