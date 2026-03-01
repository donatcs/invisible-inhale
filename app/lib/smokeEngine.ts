// ─── Types ───────────────────────────────────────────────────────────────────
export type VentilationType = "none" | "natural" | "hvac" | "hepa";
export type RoomGeometry =
  | "small_closed"
  | "medium_room"
  | "open_plan"
  | "outdoor_partial";
export type ActivityLevel = "resting" | "light" | "moderate" | "heavy";
export type AgeGroup = "infant" | "child" | "teen" | "adult" | "elderly";
export type Condition =
  | "none"
  | "asthma"
  | "copd"
  | "cardiovascular"
  | "pregnant";

export interface PollutantResult {
  name: string;
  symbol: string;
  doseUg: number;
  color: string;
  healthEffect: string;
  safeLimit: number | null;
  percentOfLimit: number | null;
}

export interface BioResult {
  serumNgMl: number;
  interpretation: string;
  label: { EN: string; HU: string };
  note: { EN: string; HU: string };
}

export interface RiskResult {
  condition: string;
  conditionHU: string;
  rrIncrease: number;
  absolutePct: number;
  baselineRisk: number;
  source: string;
  affectsGroup: string;
}

export interface CalcResult {
  pollutants: PollutantResult[];
  biomarker: BioResult;
  risks: RiskResult[];
  equivCigs: number;
  safeReentryMin: number;
  thirdhand: number;
  peakPm25: number;
  avgPm25: number;
  equivPackYears: number;
  timeline: {
    year: number;
    event: { EN: string; HU: string };
    color: string;
  }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Emission factors per cigarette (μg) — sidestream smoke [SG06, IARC Vol.83]
const EMISSION: Record<string, number> = {
  pm25: 14000,
  nicotine: 7800,
  co: 80000,
  benzene: 600,
  formaldehyde: 1500,
  acrolein: 1000,
  nnk: 200,
  polonium210: 0.04,
};

// Natural decay rates (per hour) [Repace & Lowrey 1980, Matt et al. 2004]
const DECAY: Record<string, number> = {
  pm25: 0.4,
  nicotine: 0.85,
  co: 0.05,
  benzene: 0.2,
  formaldehyde: 0.45,
  acrolein: 0.5,
  nnk: 0.3,
  polonium210: 0.0001,
};

// Air changes per hour [WHO 2010, EPA CONTAM]
const ACH: Record<VentilationType, number> = {
  none: 0.3,
  natural: 1.5,
  hvac: 4.0,
  hepa: 8.0,
};

// HEPA filtration efficiency per pollutant
const HEPA: Record<string, number> = {
  pm25: 0.997,
  nicotine: 0.5,
  co: 0.1,
  benzene: 0.3,
  formaldehyde: 0.4,
  acrolein: 0.35,
  nnk: 0.6,
  polonium210: 0.997,
};

// Breathing rates m³/hr [EPA Exposure Factors Handbook]
const BR: Record<AgeGroup, Record<ActivityLevel, number>> = {
  infant: { resting: 0.1, light: 0.15, moderate: 0.2, heavy: 0.25 },
  child: { resting: 0.3, light: 0.45, moderate: 0.8, heavy: 1.2 },
  teen: { resting: 0.4, light: 0.7, moderate: 1.5, heavy: 2.5 },
  adult: { resting: 0.5, light: 0.85, moderate: 2.0, heavy: 3.5 },
  elderly: { resting: 0.45, light: 0.7, moderate: 1.4, heavy: 2.0 },
};

// Condition sensitivity multipliers [SG06 Ch.7]
const COND: Record<Condition, number> = {
  none: 1.0,
  asthma: 1.6,
  copd: 1.8,
  cardiovascular: 1.4,
  pregnant: 1.3,
};

// Room geometry mixing factor [RL80]
const GEO: Record<RoomGeometry, number> = {
  small_closed: 1.0,
  medium_room: 0.85,
  open_plan: 0.55,
  outdoor_partial: 0.2,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function distAttenuation(d: number) {
  return Math.max(0.1, Math.min(1.0, 0.65 / Math.pow(d, 0.85)));
}

function envCorrection(t: number, rh: number) {
  return Math.max(
    0.7,
    Math.min(1.5, (1 + (t - 20) * 0.015) * (1 + (50 - rh) * 0.004)),
  );
}

function steadyState(
  key: string,
  cigsPerHr: number,
  vol: number,
  ach: number,
  vent: VentilationType,
  geo: RoomGeometry,
) {
  let C = (EMISSION[key] * cigsPerHr) / (vol * (DECAY[key] + ach));
  C *= GEO[geo];
  if (vent === "hepa") C *= 1 - HEPA[key] * 0.6;
  return C;
}

// ─── Engine ───────────────────────────────────────────────────────────────────
export function runEngine(
  cigsPerDay: number,
  smokers: number,
  yearsExposed: number,
  volumeM3: number,
  vent: VentilationType,
  geo: RoomGeometry,
  distM: number,
  tempC: number,
  rh: number,
  furn: boolean,
  age: AgeGroup,
  activity: ActivityLevel,
  cond: Condition,
  weight: number,
): CalcResult {
  const ach = ACH[vent];
  const br = BR[age][activity];
  const condM = COND[cond];
  const ec = envCorrection(tempC, rh);
  const cigsPerHr = (cigsPerDay * smokers) / 16;
  const distF = distAttenuation(distM);
  const furnF = furn ? 1.35 : 1.0;

  const doses: Record<string, number> = {};
  for (const key of Object.keys(EMISSION)) {
    const C = steadyState(key, cigsPerHr, volumeM3, ach, vent, geo);
    doses[key] = C * br * 16 * distF * condM * ec * furnF;
  }

  const pollutantMeta: Record<
    string,
    Omit<PollutantResult, "doseUg" | "percentOfLimit">
  > = {
    pm25: {
      name: "PM2.5 Fine Particles",
      symbol: "PM₂.₅",
      color: "#ef4444",
      healthEffect: "Deep lung penetration, cardiovascular damage",
      safeLimit: 60,
    },
    nicotine: {
      name: "Nicotine",
      symbol: "C₁₀H₁₄N₂",
      color: "#f97316",
      healthEffect: "Cardiovascular, neurodevelopment, thirdhand smoke",
      safeLimit: null,
    },
    co: {
      name: "Carbon Monoxide",
      symbol: "CO",
      color: "#94a3b8",
      healthEffect: "Oxygen displacement, heart disease, impaired cognition",
      safeLimit: 5000,
    },
    benzene: {
      name: "Benzene",
      symbol: "C₆H₆",
      color: "#f59e0b",
      healthEffect: "Leukemia, aplastic anemia, bone marrow damage",
      safeLimit: 1.7,
    },
    formaldehyde: {
      name: "Formaldehyde",
      symbol: "HCHO",
      color: "#eab308",
      healthEffect: "Nasopharyngeal cancer, airway irritation",
      safeLimit: 5.0,
    },
    acrolein: {
      name: "Acrolein",
      symbol: "C₃H₄O",
      color: "#fb923c",
      healthEffect: "Airway damage, COPD, mucociliary impairment",
      safeLimit: 2.5,
    },
    nnk: {
      name: "NNK Nitrosamine",
      symbol: "NNK",
      color: "#dc2626",
      healthEffect: "Lung & pancreatic cancer — most potent SHS carcinogen",
      safeLimit: null,
    },
    polonium210: {
      name: "Polonium-210",
      symbol: "²¹⁰Po",
      color: "#ff2d55",
      healthEffect: "Alpha radiation to lung tissue, lung cancer",
      safeLimit: null,
    },
  };

  const pollutants: PollutantResult[] = Object.entries(pollutantMeta).map(
    ([key, m]) => ({
      ...m,
      doseUg: doses[key] || 0,
      percentOfLimit: m.safeLimit
        ? ((doses[key] || 0) / m.safeLimit) * 100
        : null,
    }),
  );

  // Cotinine biomarker [CDC NHANES, SG06 pharmacokinetics]
  const serumNgMl = ((doses.nicotine * 0.7 * 0.75) / (0.5 * weight)) * 1000;
  let label: BioResult["label"];
  let note: BioResult["note"];
  let interpretation: string;
  if (serumNgMl < 0.05) {
    interpretation = "background";
    label = { EN: "Background — Non-exposed", HU: "Háttérszint — Nem kitett" };
    note = {
      EN: "No significant SHS exposure detected.",
      HU: "Nem észlelhető jelentős passzív kitettség.",
    };
  } else if (serumNgMl < 1.0) {
    interpretation = "low";
    label = { EN: "Low SHS Exposure", HU: "Alacsony passzív kitettség" };
    note = {
      EN: "Detectable. Consistent with occasional SHS exposure.",
      HU: "Kimutatható. Alkalmi passzív kitettségre utal.",
    };
  } else if (serumNgMl < 10.0) {
    interpretation = "moderate";
    label = {
      EN: "Moderate — Clinically Significant",
      HU: "Mérsékelt — Klinikailag szignifikáns",
    };
    note = {
      EN: "A doctor would flag this. Equivalent to living with a smoker.",
      HU: "Egy orvos jelezné. Egyenértékű dohányzóval való együttéléssel.",
    };
  } else {
    interpretation = "high";
    label = {
      EN: "High — Active Smoker Range",
      HU: "Magas — Aktív dohányos tartomány",
    };
    note = {
      EN: "Cotinine overlaps with light active smokers. Urgent action needed.",
      HU: "A kotinin könnyű aktív dohányosokéval esik egybe. Sürgős cselekvés szükséges.",
    };
  }

  // Health risks [Hackshaw 1997, He 1999, Bonita 1999, SG06 Ch.7]
  const doseScale = Math.min(5.0, (doses.pm25 / 1000) * (yearsExposed / 10));
  const risks: RiskResult[] = [
    {
      condition: "Lung Cancer",
      conditionHU: "Tüdőrák",
      rrIncrease: 1 + 0.24 * doseScale,
      absolutePct: 0.24 * doseScale * 5.5,
      baselineRisk: 5.5,
      source: "Hackshaw 1997 + SG06",
      affectsGroup: "All",
    },
    {
      condition: "Coronary Heart Disease",
      conditionHU: "Koszorúér-betegség",
      rrIncrease: 1 + 0.25 * Math.min(doseScale, 3),
      absolutePct: 0.25 * Math.min(doseScale, 3) * 15,
      baselineRisk: 15.0,
      source: "He et al. 1999",
      affectsGroup: "Adults 40+",
    },
    {
      condition: "Stroke",
      conditionHU: "Stroke",
      rrIncrease: 1 + 0.82 * Math.min(doseScale / 2, 1),
      absolutePct: 0.82 * Math.min(doseScale / 2, 1) * 7,
      baselineRisk: 7.0,
      source: "Bonita 1999",
      affectsGroup: "Adults 40+",
    },
    {
      condition: "Asthma / Respiratory",
      conditionHU: "Asztma / Légzőszervi",
      rrIncrease: 1 + 0.4 * doseScale * (age === "child" ? 1.8 : 1.0),
      absolutePct: 0.4 * doseScale * 8,
      baselineRisk: 8.0,
      source: "SG06 Ch.7",
      affectsGroup: age === "child" ? "Children ↑" : "All",
    },
  ];

  const equivCigs = doses.pm25 / 1000;
  const equivPackYears = (equivCigs * yearsExposed) / 20;
  const peakPm25 = steadyState("pm25", cigsPerHr, volumeM3, ach, vent, geo);
  const safeReentryMin =
    peakPm25 > 15
      ? Math.round((Math.log(peakPm25 / 15) / (DECAY.pm25 + ach)) * 60)
      : 0;

  const milestones = [
    {
      atYear: 1,
      color: "#f59e0b",
      EN: "Increased respiratory infections, eye & throat irritation",
      HU: "Fokozott légúti fertőzések, szem- és torokirritáció",
    },
    {
      atYear: 3,
      color: "#f97316",
      EN: "Measurable cotinine in blood. Lung capacity begins declining",
      HU: "Mérhető kotinin a vérben. Tüdőkapacitás csökkenni kezd",
    },
    {
      atYear: 5,
      color: "#f97316",
      EN: "Chronic cough, elevated platelet aggregation — CHD precursor",
      HU: "Krónikus köhögés, emelkedett trombocita-aggregáció",
    },
    {
      atYear: 10,
      color: "#ef4444",
      EN: "CHD risk +25%, stroke risk +15%. Lung damage becoming permanent",
      HU: "Szívbetegség +25%, stroke +15%. Tüdőkárosodás tartóssá válik",
    },
    {
      atYear: 15,
      color: "#ef4444",
      EN: "Measurable DNA adducts in lung cells. Lung cancer risk significant",
      HU: "Mérhető DNS-adduktok a tüdősejtekben. Tüdőrák kockázata szignifikáns",
    },
    {
      atYear: 20,
      color: "#ff2d55",
      EN: "Lung cancer risk +24%. Chronic COPD likely. Cardiovascular age +5–8yrs",
      HU: "Tüdőrák +24%. Krónikus COPD valószínű. Szív-életkor +5-8 évvel",
    },
  ];

  const timeline = milestones
    .filter((m) => m.atYear <= yearsExposed + 1)
    .map((m) => ({
      year: m.atYear,
      event: { EN: m.EN, HU: m.HU },
      color: m.color,
    }));

  return {
    pollutants,
    biomarker: { serumNgMl, interpretation, label, note },
    risks,
    equivCigs,
    safeReentryMin,
    thirdhand: Math.min(
      100,
      Math.round((doses.nicotine / (furn ? 500 : 800)) * 100),
    ),
    peakPm25: Math.round(peakPm25 * 10) / 10,
    avgPm25: Math.round(peakPm25 * 0.75 * 10) / 10,
    equivPackYears: Math.round(equivPackYears * 100) / 100,
    timeline,
  };
}
