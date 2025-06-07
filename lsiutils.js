// --- LSI FACTOR TABLES (originally from calculator.js, then script.js) ---
const ALKALINITY_FACTORS = [
    { ppm: 5, factor: 0.7 }, { ppm: 25, factor: 1.4 }, { ppm: 50, factor: 1.7 },
    { ppm: 75, factor: 1.9 }, { ppm: 100, factor: 2.0 }, { ppm: 125, factor: 2.1 },
    { ppm: 150, factor: 2.2 }, { ppm: 200, factor: 2.3 }, { ppm: 250, factor: 2.4 },
    { ppm: 300, factor: 2.5 }, { ppm: 400, factor: 2.6 }, { ppm: 800, factor: 2.9 },
    { ppm: 1000, factor: 3.0 }
];

const CALCIUM_FACTORS = [
    { ppm: 5, factor: 0.3 }, { ppm: 25, factor: 1.0 }, { ppm: 50, factor: 1.3 },
    { ppm: 75, factor: 1.5 }, { ppm: 100, factor: 1.6 }, { ppm: 125, factor: 1.7 },
    { ppm: 150, factor: 1.8 }, { ppm: 200, factor: 1.9 }, { ppm: 250, factor: 2.0 },
    { ppm: 300, factor: 2.1 }, { ppm: 400, factor: 2.2 }, { ppm: 800, factor: 2.5 },
    { ppm: 1000, factor: 2.6 }
];

const TEMP_FACTORS = [
    { temp: 32, factor: 0.1 }, { temp: 37, factor: 0.1 }, { temp: 46, factor: 0.2 },
    { temp: 53, factor: 0.3 }, { temp: 60, factor: 0.4 }, { temp: 66, factor: 0.5 },
    { temp: 76, factor: 0.6 }, { temp: 84, factor: 0.7 }, { temp: 94, factor: 0.8 },
    { temp: 104, factor: 0.9 }, { temp: 128, factor: 1.0 }
];

// TDS correction
function getTDSFactor(tds) {
    if (tds <= 800) return 12.1;
    if (tds <= 1500) return 12.2;
    if (tds <= 2900) return 12.3;
    if (tds <= 5500) return 12.4;
    return 12.5;
}

// Always use the next factor up (ceiling logic)
function getFactorCeil(value, table, key = 'ppm') {
    for (let i = 0; i < table.length; i++) {
        if (value <= table[i][key]) return table[i].factor;
    }
    // If value is above all, return the last factor
    return table[table.length - 1].factor;
}

// --- Advanced LSI Calculation ---
export function advancedLSI({ ph, tempF, calcium, alkalinity, cya, tds }) {
    // CYA-corrected alkalinity
    let correctedAlk = parseFloat(alkalinity) - (parseFloat(cya) / 3);
    if (correctedAlk < 0) correctedAlk = 0;
  
    const alkFactor = getFactorCeil(correctedAlk, ALKALINITY_FACTORS);
    const calFactor = getFactorCeil(parseFloat(calcium), CALCIUM_FACTORS);
    const tempFactor = getFactorCeil(parseFloat(tempF), TEMP_FACTORS, 'temp');
    const tdsFactor = getTDSFactor(parseFloat(tds));
  
    // LSI formula: pH + calcium factor + alkalinity factor + temp factor - TDS factor
    return parseFloat(ph) + calFactor + alkFactor + tempFactor - tdsFactor;
}

// --- LSI Factors Helper ---
export function getLSIFactors({ ph, tempF, calcium, alkalinity, cya, tds }) {
  // CYA-corrected alkalinity
  let correctedAlk = parseFloat(alkalinity) - (parseFloat(cya) / 3);
  if (correctedAlk < 0) correctedAlk = 0;

  const alkFactor = getFactorCeil(correctedAlk, ALKALINITY_FACTORS);
  const calFactor = getFactorCeil(parseFloat(calcium), CALCIUM_FACTORS);
  const tempFactor = getFactorCeil(parseFloat(tempF), TEMP_FACTORS, 'temp');
  const tdsFactor = getTDSFactor(parseFloat(tds));

  // LSI formula: pH + calcium factor + alkalinity factor + temp factor - TDS factor
  const lsi = parseFloat(ph) + calFactor + alkFactor + tempFactor - tdsFactor;

  return {
    lsi,
    ph: parseFloat(ph),
    alk: parseFloat(alkalinity),
    correctedAlk: correctedAlk,
    alkFactor,
    calcium: parseFloat(calcium),
    calFactor,
    tempF: parseFloat(tempF),
    tempFactor,
    tds: parseFloat(tds),
    tdsFactor,
    cya: parseFloat(cya)
  };
}