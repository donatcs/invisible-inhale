export type ChemicalName = keyof typeof CHEMICALS_RAW;
export type ChemicalData = {
  use: { EN: string; HU: string };
  toxicity: { EN: string; HU: string };
  level: 1 | 2 | 3 | 4 | 5;
  healthEffects: { EN: string; HU: string };
  source: { EN: string; HU: string };
  sourceUrl: string;
  prevention: { EN: string; HU: string };
};

export const CHEMICALS_RAW = {
  Formaldehyde: {
    use: { EN: "Embalming fluid", HU: "Balzsamozó folyadék" },
    toxicity: { EN: "Carcinogen", HU: "Rákkeltő" },
    level: 2,
    healthEffects: {
      EN: "Eye, nose, and throat irritation; increased cancer risk.",
      HU: "Szem-, orr- és torokirritáció; fokozott rákkockázat.",
    },
    source: { EN: "CDC", HU: "CDC" },
    sourceUrl: "https://www.cdc.gov/formaldehyde/",
    prevention: {
      EN: "Avoid exposure, ventilate spaces, use air purifiers.",
      HU: "Kerülje az expozíciót, szellőztessen, használjon légtisztítót.",
    },
  },
  Benzene: {
    use: { EN: "Gasoline additive", HU: "Benzin adalék" },
    toxicity: { EN: "High", HU: "Magas" },
    level: 3,
    healthEffects: {
      EN: "Blood disorders, leukemia, immune system damage.",
      HU: "Vérbetegségek, leukémia, immunrendszer károsodása.",
    },
    source: { EN: "CDC/NIOSH", HU: "CDC/NIOSH" },
    sourceUrl: "https://www.cdc.gov/niosh/topics/benzene/",
    prevention: {
      EN: "Avoid smoke, use protective equipment in workplaces.",
      HU: "Kerülje a füstöt, használjon védőfelszerelést munkahelyeken.",
    },
  },
  Arsenic: {
    use: { EN: "Rat poison", HU: "Patkányméreg" },
    toxicity: { EN: "Lethal", HU: "Halálos" },
    level: 4,
    healthEffects: {
      EN: "Skin lesions, cancer, cardiovascular disease.",
      HU: "Bőrelváltozások, rák, szív- és érrendszeri betegségek.",
    },
    source: { EN: "WHO", HU: "WHO" },
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/arsenic",
    prevention: {
      EN: "Avoid contaminated sources, ensure clean water.",
      HU: "Kerülje a szennyezett forrásokat, biztosítson tiszta vizet.",
    },
  },
  Ammonia: {
    use: { EN: "Toilet cleaner", HU: "WC tisztító" },
    toxicity: { EN: "Irritant", HU: "Irritáló" },
    level: 1,
    healthEffects: {
      EN: "Respiratory irritation, coughing, asthma aggravation.",
      HU: "Légúti irritáció, köhögés, asztma súlyosbodása.",
    },
    source: { EN: "CDC/NIOSH", HU: "CDC/NIOSH" },
    sourceUrl: "https://www.cdc.gov/niosh/topics/ammonia/",
    prevention: {
      EN: "Ventilate, avoid mixing with bleach, minimize exposure.",
      HU: "Szellőztessen, ne keverje hipóval, minimalizálja az expozíciót.",
    },
  },
  "Polonium-210": {
    use: { EN: "Radioactive element", HU: "Radioaktív elem" },
    toxicity: { EN: "Radioactive", HU: "Radioaktív" },
    level: 5,
    healthEffects: {
      EN: "Radiation poisoning, lung cancer risk.",
      HU: "Sugárfertőzés, tüdőrák kockázata.",
    },
    source: {
      EN: "American Cancer Society",
      HU: "Amerikai Rákkutató Társaság",
    },
    sourceUrl:
      "https://www.cancer.org/cancer/risk-prevention/tobacco/secondhand-smoke.html",
    prevention: {
      EN: "Avoid tobacco smoke, support smoke-free policies.",
      HU: "Kerülje a dohányfüstöt, támogassa a füstmentes szabályokat.",
    },
  },
} as const;

export const CHEMICALS: Record<ChemicalName, ChemicalData> = CHEMICALS_RAW;

export const TOXICITY_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "#94a3b8",
  2: "#f59e0b",
  3: "#f97316",
  4: "#ef4444",
  5: "#ff2d55",
};
