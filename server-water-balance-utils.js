const { goldenNumbers } = require('./public/config.js');
const { advancedLSI } = require('./server-lsiutils.js')

// --- Helper Functions for Dose Calculations ---

// Estimate pH rise from sodium bicarbonate dose
function estimatePhRiseFromBicarb(alkalinityIncrease) {
    // Empirical: ~0.03 pH units per 10 ppm increase
    return (alkalinityIncrease / 10) * 0.03;
  }
  
  // Estimate pH drop from cyanuric acid dose
  function estimatePhDropFromCya(cyaIncrease) {
    // Empirical: ~0.07 pH units per 10 ppm increase
    return (cyaIncrease / 10) * 0.07;
  }
  
  // Sodium bicarbonate dose (to raise alkalinity)
  function alkalinityDose(current, target, gallons) {
    if (target <= current) return null;
    // 1.5 lbs sodium bicarb per 10,000 gal raises TA by 10 ppm
    const doseLbs = ((target - current) / 10) * 1.5 * (gallons / 10000);
    return doseLbs > 0
      ? `${doseLbs.toFixed(2)} lbs sodium bicarbonate`
      : null;
  }
  
  // Calcium chloride dose (to raise calcium hardness)
  function calciumDose(current, target, gallons) {
    if (target <= current) return null;
    // 1.25 lbs calcium chloride per 10,000 gal raises CH by 10 ppm
    const doseLbs = ((target - current) / 10) * 1.25 * (gallons / 10000);
    return doseLbs > 0
      ? `${doseLbs.toFixed(2)} lbs calcium chloride`
      : null;
  }
  
  // Cyanuric acid dose (to raise CYA)
  function cyaDose(current, target, gallons) {
    if (target <= current) return null;
    // 13 oz stabilizer per 10,000 gal raises CYA by 10 ppm
    const doseOz = ((target - current) / 10) * 13 * (gallons / 10000);
    return doseOz > 16
      ? `${(doseOz / 16).toFixed(2)} lbs (${doseOz.toFixed(1)} oz) stabilizer`
      : `${doseOz.toFixed(1)} oz stabilizer`;
  }
  
  // Acid dose to lower pH
  function acidDose(current, target, gallons, alkalinity) {
  return acidDoseToLowerPh(current, target, gallons, alkalinity);
  }
  
  function acidDoseToLowerPh(currentPh, targetPh, gallons, alkalinity) {
    if (currentPh <= targetPh) return null;
    const pHdrop = currentPh - targetPh;
    // 1.3 fl oz per 0.1 pH drop per 10,000 gal at TA 100
    const acidFlOz = 1.3 * (alkalinity / 100) * (pHdrop / 0.1) * (gallons / 10000);
    if (acidFlOz <= 0) return null;
    if (acidFlOz < 128) {
      return `${acidFlOz.toFixed(1)} fl oz muriatic acid`;
    } else {
      return `${(acidFlOz / 128).toFixed(2)} gal (${acidFlOz.toFixed(1)} fl oz) muriatic acid`;
    }
  }
  
  // Soda ash dose to raise pH
  function sodaAshDose(current, target, gallons, alkalinity) {
    if (current >= target) return null;
    const diff = target - current;
    if (diff <= 0) return null;
    const ounces = (diff / 0.2) * 6 * (gallons / 10000);
    if (ounces <= 0) return null;
    if (ounces > 16) {
      return `${(ounces / 16).toFixed(2)} lbs (${ounces.toFixed(1)} oz) soda ash`;
    } else {
      return `${ounces.toFixed(1)} oz soda ash`;
    }
  }
  
  function acidDoseForAlk(currentAlk, targetAlk, gallons) {
    if (currentAlk <= targetAlk) return null;
    const ppmDrop = currentAlk - targetAlk;
    // Orenda: 0.2 gal per 10,000 gal per 10 ppm drop (31.45% muriatic acid)
    const gallonsAcid = (ppmDrop / 10) * 0.2 * (gallons / 10000);
    const flOz = gallonsAcid * 128;
    if (gallonsAcid < 0.01) return null;
    if (gallonsAcid < 1) {
      return `${flOz.toFixed(1)} fl oz muriatic acid`;
    } else {
      // For extremely high alkalinity, only show gallons (no fl oz conversion)
      return `${gallonsAcid.toFixed(2)} gal muriatic acid`;
    }
  }
  
  function splitAcidDose(totalDose, days, currentAlk = null, targetAlk = null) {
    if (!totalDose) return null;
    
    // Extract the numeric amount and unit from the total dose string
    const match = totalDose.match(/(\d+\.?\d*)\s*(gal|fl oz)/);
    if (!match) return `Add 1/${days} of total dose ${totalDose} per day for ${days} days`;
    
    const amount = parseFloat(match[1]);
    const unit = match[2];
    const dailyAmount = (amount / days).toFixed(2);
    
    if (unit === 'gal') {
      // Include the alkalinity range in the main message
      const alkRange = (currentAlk && targetAlk) ? ` to lower alkalinity from ${currentAlk} ppm to ${targetAlk} ppm` : '';
      return `Since alkalinity is above 180 ppm, we must lower this before attempting to adjust other parameters. To lower alkalinity, add <bold>${dailyAmount}<bold> gal of muriatic acid directly to the pool every day for ${days} straight days${alkRange}. Retest alkalinity each day to confirm progress. Only add acid at night after the pool closes.`;
    } else {
      return `Add ${dailyAmount} ${unit} muriatic acid per day for ${days} days`;
    }
  }

function getWaterBalanceSteps({
  poolType = 'pool',
  poolVolume = 10000,
  current = { cya: 0, alkalinity: 0, calcium: 0, ph: 7.5 },
  targets = {},
  tempF = 77,
  tds = 1000
}) {
  // Example golden numbers (replace with your config.js import if needed)
  let t = { ...goldenNumbers[poolType], ...targets };
  let notes = [];

  // Order: Alkalinity, Calcium, CYA, pH
  const steps = [];

   // --- Super High Alkalinity/Calcium Logic ---
   const superHighAlk = current.alkalinity > 180;
   const superHighCa = current.calcium > 600;
   const highCa = current.calcium > 400;
   
   // Calculate LSI for current water
   const lsi = advancedLSI({
    ph: current.ph,
    tempF: tempF,
    calcium: current.calcium,
    alkalinity: current.alkalinity,
    cya: current.cya !== undefined ? current.cya : 0,
    tds: tds !== undefined ? tds : 1000
   });
 
   // PRIORITY 1: Super high alkalinity ALWAYS takes precedence
   // If alkalinity is above 180, prioritize alkalinity reduction regardless of calcium levels
   if (superHighAlk) {
    // Calculate total acid needed to bring alk to 100
    const totalAcidDose = acidDoseForAlk(current.alkalinity, 100, poolVolume);
    // Split over 3 days - now pass the alkalinity values
    const perDayDose = splitAcidDose(totalAcidDose, 3, current.alkalinity, 100);
    steps.push({
      key: 'alkalinity',
      parameter: 'Total Alkalinity',
      current: current.alkalinity,
      target: 100,
      dose: perDayDose,
      note: 'Alkalinity is extremely high. Lower alkalinity in stages over 3 days before adjusting other parameters.'
    });
    notes.push('Alkalinity is extremely high. Lower alkalinity in stages over 3 days before adjusting other parameters.');
    
    // If calcium is also super high, add additional note about future calcium management
    if (superHighCa) {
      notes.push('Both alkalinity and calcium are extremely high. Address alkalinity first, then manage calcium with lower pH target (7.2) in subsequent visits.');
    }
    
    // Defer all other adjustments when alkalinity is super high
    return { steps, notes };
   }
 
   // PRIORITY 2: If super high calcium (but alkalinity is NOT super high), lower pH target for LSI
   if (superHighCa && !superHighAlk) {
    t.ph = 7.2;
    notes.push('Calcium is extremely high (>600 ppm) and alkalinity is manageable. Lower pH target to 7.2 for LSI balance.');
   }
 
   // If LSI > 0.5, show warning and prioritize alk/pH (only if alkalinity wasn't already handled above)
   if (
    lsi > 0.5 &&
    ((current.alkalinity > t.alkalinity) || (current.ph > t.ph)) &&
    !superHighAlk
  ) {
    notes.push('LSI is in extreme scaling condition (>0.5). Prioritize lowering alkalinity and pH.');
  }

  // --- Alkalinity Step ---
  let alkDose = alkalinityDose(current.alkalinity, t.alkalinity, poolVolume);
  let anticipatedPh = current.ph;
  let anticipatedPhNote = null;
  let anticipatedAcidDose = null;
  let anticipatedSodaAshDoseAfterAlk = null;

  if (alkDose) {
    // Calculate anticipated pH rise from sodium bicarbonate
    const alkIncrease = t.alkalinity - current.alkalinity;
    const phRise = estimatePhRiseFromBicarb(alkIncrease);
    anticipatedPh = +(current.ph + phRise).toFixed(2);

    // If anticipated pH is above target, recommend acid dose
    if (anticipatedPh > t.ph) {
      anticipatedAcidDose = acidDose(anticipatedPh, t.ph, poolVolume, t.alkalinity);
      anticipatedPhNote = `Note: Adding sodium bicarbonate to raise alkalinity by ${alkIncrease} ppm is expected to raise pH from ${current.ph} to approximately ${anticipatedPh}. After the bicarb is fully dispersed (wait 10 minutes), test pH and add acid as needed to bring pH down to ${t.ph}. Recommended acid dose: ${anticipatedAcidDose}.`;
      notes.push(anticipatedPhNote);
    } else {
      anticipatedPhNote = `Note: Adding sodium bicarbonate to raise alkalinity by ${alkIncrease} ppm is expected to raise pH from ${current.ph} to approximately ${anticipatedPh}.`;
      notes.push(anticipatedPhNote);
    }

    // If anticipated pH is below target, recommend soda ash dose
    if (anticipatedPh < t.ph) {
      anticipatedSodaAshDoseAfterAlk = sodaAshDose(anticipatedPh, t.ph, poolVolume, t.alkalinity);
    }
  }

  steps.push({
    key: 'alkalinity',
    parameter: 'Total Alkalinity',
    current: current.alkalinity,
    target: t.alkalinity,
    dose: alkDose,
    anticipatedPh: alkDose ? anticipatedPh : null,
    anticipatedAcidDose: anticipatedAcidDose,
    anticipatedSodaAshDoseAfterAlk
  });

  // --- Calcium Hardness Step ---
  steps.push({
    key: 'calcium',
    parameter: 'Calcium Hardness',
    current: current.calcium,
    target: t.calcium,
    dose: calciumDose(current.calcium, t.calcium, poolVolume)
  });

  // --- CYA Step ---
  let cyaStepDose = cyaDose(current.cya, t.cya, poolVolume);
  let anticipatedPhAfterCya = anticipatedPh;
  let cyaPhNote = null;
  let cyaSodaAshDose = null;

  if (cyaStepDose) {
    // Calculate anticipated pH drop from cyanuric acid
    const cyaIncrease = t.cya - current.cya;
    const phDrop = estimatePhDropFromCya(cyaIncrease);
    anticipatedPhAfterCya = +(anticipatedPh - phDrop).toFixed(2);

    // If anticipated pH after CYA is below target, recommend soda ash dose
    if (anticipatedPhAfterCya < t.ph) {
      cyaSodaAshDose = sodaAshDose(anticipatedPhAfterCya, t.ph, poolVolume, t.alkalinity);
      cyaPhNote = `Note: Adding cyanuric acid to raise CYA by ${cyaIncrease} ppm is expected to lower pH from ${anticipatedPh} to approximately ${anticipatedPhAfterCya}. After the CYA is fully dispersed (wait 30 minutes), test pH and add soda ash as needed to bring pH up to ${t.ph}. Recommended soda ash dose: ${cyaSodaAshDose}.`;
      notes.push(cyaPhNote);
    } else {
      cyaPhNote = `Note: Adding cyanuric acid to raise CYA by ${cyaIncrease} ppm is expected to lower pH from ${anticipatedPh} to approximately ${anticipatedPhAfterCya}.`;
      notes.push(cyaPhNote);
    }
  }

  steps.push({
    key: 'cya',
    parameter: 'Cyanuric Acid',
    current: current.cya,
    target: t.cya,
    dose: cyaStepDose,
    anticipatedPh: cyaStepDose ? anticipatedPhAfterCya : null,
    anticipatedSodaAshDose: cyaSodaAshDose
  });

  // --- pH Step (can be up or down) ---
  let phDoseVal = null; // Renamed to avoid conflict with function name
  // pH adjustment should consider the pH after previous steps if they occurred
  let phToAdjustFrom = anticipatedPhAfterCya; // This is pH after alk and CYA adjustments
  
  if (phToAdjustFrom > t.ph) {
    phDoseVal = acidDose(phToAdjustFrom, t.ph, poolVolume, t.alkalinity); // Use t.alkalinity as it's the target
  } else if (phToAdjustFrom < t.ph) {
    phDoseVal = sodaAshDose(phToAdjustFrom, t.ph, poolVolume, t.alkalinity); // Use t.alkalinity
  }
  steps.push({
    key: 'ph', parameter: 'pH', current: current.ph, // Report original current pH
    target: t.ph, dose: phDoseVal,
    note: phDoseVal ? `This pH dose is calculated based on an anticipated pH of ${phToAdjustFrom.toFixed(2)} after other adjustments.` : null
  });
  // Filter out notes that are just the dose message for pH if a dose was calculated
  if (phDoseVal) {
    notes = notes.filter(note => !note.startsWith('This pH dose is calculated based on an anticipated pH'));
    if (steps.find(s => s.key === 'ph' && s.note)) {
        notes.push(steps.find(s => s.key === 'ph').note);
    }
  }



  return { steps, notes };
}

module.exports = { getWaterBalanceSteps };