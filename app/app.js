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
  // Constants based on environmental health studies
  const CIGS_PER_DAY_PASSIVE = 1.5;
  const YEARS_EXPOSED = 25;

  const [years, setYears] = useState(YEARS_EXPOSED);
  const [stats, setStats] = useState({ totalCigs: 0, lungsImpact: 0 });

  useEffect(() => {
    const total = years * 365 * CIGS_PER_DAY_PASSIVE;
    setStats({
      totalCigs: Math.round(total),
      moneyWasted: Math.round(total * 0.5), // Hypothetical healthcare/cleaning cost
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
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
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
            onChange={(e) => setYears(e.target.value)}
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
      </main>

      <footer className="max-w-4xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-zinc-600 text-sm">
        <p>
          This is a data visualization based on my 25 years of lived experience.
          Secondhand smoke is an invisible burden.
        </p>
      </footer>
    </div>
  );
}
