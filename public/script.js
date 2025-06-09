import { poolStandards, chlorineTypes, goldenNumbers } from './config.js';
import { renderAlkalinityDisplay } from './AlkalinityDisplay.js';
import { renderCalciumHardnessDisplay } from './CalciumHardnessDisplay.js';
import { renderPhDisplay } from './PhDisplay.js';
import { renderCyaDisplay } from './CyaDisplay.js';
import { renderTdsDisplay } from './TdsDisplay.js';
import { renderChlorineScaleDisplay } from './ChlorineScaleDisplay.js';
import { renderLSIScale, renderLSIComponentsTable } from './LsiDisplay.js';
import { renderWaterBalanceSteps } from './WaterBalanceDisplay.js';
import { renderTodayDosageCards } from './WaterBalanceUtils.js';
import { renderBreakpointChlorination } from './BreakpointChlorinationDisplay.js';
 
// --- State and Pool Type Buttons ---
const stateOptionsDiv = document.getElementById('stateOptions');
const poolTypeOptionsDiv = document.getElementById('poolTypeOptions');

// List your supported states and pool types
const stateList = ["Arizona", "Florida", "Texas"];
let selectedState = null;

stateList.forEach(state => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'state-type-btn';
  btn.textContent = state;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.state-type-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedState = state;
  });
  stateOptionsDiv.appendChild(btn);
});

const poolTypeList = ["pool", "spa"];
let selectedPoolType = null;

poolTypeList.forEach(type => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pool-type-btn';
  btn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pool-type-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedPoolType = type;
  });
  poolTypeOptionsDiv.appendChild(btn);
});
// --- Chlorine Type Buttons ---
const chlorineTypeOptionsDiv = document.getElementById('chlorineTypeOptions');
let selectedChlorineType = null;

// Only show allowed chlorine types (exclude 10% liquid and 68% cal-hypo)
const allowedChlorineTypes = chlorineTypes.filter(type =>
  type.name !== "Liquid Chlorine (10%)" && type.name !== "Calcium Hypochlorite (68%)"
);

// Dynamically create clickable chlorine type buttons
allowedChlorineTypes.forEach(type => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chlorine-type-btn';
  btn.textContent = type.name;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chlorine-type-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedChlorineType = type;
  });
  chlorineTypeOptionsDiv.appendChild(btn);
});

// --- Combined Chlorine Calculation (live update) ---
const freeChlorineInput = document.getElementById('freeChlorine');
const totalChlorineInput = document.getElementById('totalChlorine');
const combinedChlorineInput = document.getElementById('combinedChlorine');

function updateCombinedChlorine() {
  const fc = parseFloat(freeChlorineInput.value) || 0;
  const tc = parseFloat(totalChlorineInput.value) || 0;
  const cc = Math.max(tc - fc, 0);
  combinedChlorineInput.value = cc.toFixed(2);
}
freeChlorineInput.addEventListener('input', updateCombinedChlorine);
totalChlorineInput.addEventListener('input', updateCombinedChlorine);

// --- Form Inputs ---
const poolCapacityInput = document.getElementById('poolCapacity');
const cyaInput = document.getElementById('cya');
const phInput = document.getElementById('ph');
const alkalinityInput = document.getElementById('alkalinity');
const calciumInput = document.getElementById('calcium');
const saltLevelInput = document.getElementById('saltLevel');
const targetSaltLevelSelect = document.getElementById('targetSaltLevel');
const temperatureInput = document.getElementById('temperature');
const tdsInput = document.getElementById('tds');
const stateSelect = document.getElementById('stateSelect');
const poolTypeSelect = document.getElementById('poolTypeSelect');
const resultsDiv = document.getElementById('results');

// --- Helper: Get Standards for Current Selection ---
function getCurrentStandards() {
  const state = selectedState;
  const poolType = selectedPoolType;
  if (!state || !poolType) return null;
  return poolStandards[state][poolType];
}

// --- Helper: Range Warnings ---
function getWarnings(values, standards) {
  const warnings = [];
  if (values.freeChlorine < standards.freeChlorine.min)
    warnings.push(`Free Chlorine is below minimum (${standards.freeChlorine.min} ppm).`);
  if (values.freeChlorine > standards.freeChlorine.max)
    warnings.push(`Free Chlorine is above maximum (${standards.freeChlorine.max} ppm).`);
  if (standards.freeChlorine.cyaRatio && values.freeChlorine < values.cya * standards.freeChlorine.cyaRatio)
    warnings.push(`Free Chlorine is below 5% of CYA (min required: ${(values.cya * standards.freeChlorine.cyaRatio).toFixed(2)} ppm).`);
  if (values.ph < standards.pH.min || values.ph > standards.pH.max)
    warnings.push(`pH is out of range (${standards.pH.min} - ${standards.pH.max}).`);
  if (values.alkalinity < standards.alkalinity.min || values.alkalinity > standards.alkalinity.max)
    warnings.push(`Alkalinity is out of range (${standards.alkalinity.min} - ${standards.alkalinity.max} ppm).`);
  if (values.cya < standards.cya.min)
    warnings.push(`Cyanuric Acid is below minimum (${standards.cya.min} ppm).`);
  if (values.cya > standards.cya.max)
    warnings.push(`Cyanuric Acid is above maximum (${standards.cya.max} ppm).`);
  if (standards.calcium.min && values.calcium < standards.calcium.min)
    warnings.push(`Calcium Hardness is below minimum (${standards.calcium.min} ppm).`);
  if (standards.calcium.max && values.calcium > standards.calcium.max)
    warnings.push(`Calcium Hardness is above maximum (${standards.calcium.max} ppm).`);
  return warnings;
}

// --- Dose Visualization Table ---
// Modified to fetch data from the server
async function renderChlorineDoseTable({currentFC, poolVolume, chlorineType, minFC, maxFC, increment}) {
  let html = `<h3>Manual Chlorine Addition Guide</h3>
    <table class="dose-table">
    <thead>
    <tr>
    <th>Target FC (ppm)</th>
    <th>Dose Needed (${chlorineType.name})</th>
    </tr>
    </thead>
    <tbody>
  `;

  try {
    const response = await fetch('/api/calculate-chlorine-dose-table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentFC,
        poolVolume,
        chlorineTypeId: chlorineType.id, // 'liquid' or 'cal-hypo'
        chlorineConcentration: chlorineType.concentration,
        minFC,
        maxFC,
        increment,
        poolType: selectedPoolType // 'pool' or 'spa'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to calculate chlorine dose table: ${response.status}`);
    }

    const { tableRows } = await response.json();

    tableRows.forEach(row => {
      html += `<tr>
      <td>${row.targetFC}</td>
      <td>${row.doseDisplay}</td>
      </tr>`;
    });

  } catch (error) {
    console.error("Error fetching chlorine dose table:", error);
    html += `<tr><td colspan="2" style="color:red;">Error loading dose information: ${error.message}</td></tr>`;
  }

  html += `</tbody></table>`;
  return html;
}
// --- Form Submission ---
document.getElementById('poolForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Validate chlorine type selection
  if (!selectedChlorineType) {
    alert('Please select a chlorine type.');
    return;
  }
  if (!selectedState) {
    alert('Please select a state.');
    return;
  }
  if (!selectedPoolType) {
    alert('Please select a pool type.');
    return;
  }
  // Gather all input values
  const values = {
    poolVolume: parseFloat(poolCapacityInput.value),
    freeChlorine: parseFloat(freeChlorineInput.value),
    totalChlorine: parseFloat(totalChlorineInput.value),
    cya: parseFloat(cyaInput.value),
    ph: parseFloat(phInput.value),
    alkalinity: parseFloat(alkalinityInput.value),
    calcium: parseFloat(calciumInput.value),
    saltLevel: parseFloat(saltLevelInput.value),
    targetSaltLevel: parseFloat(targetSaltLevelSelect.value),
    temperature: parseFloat(temperatureInput.value),
    tds: parseFloat(tdsInput.value)
  };
  // Expert Mode custom targets
  const isExpert = window.expertModeCheckbox && window.expertModeCheckbox.checked;
  let expertCustomTargets = {}; // Holds valid, user-entered expert targets

  if (isExpert) {
    const rawExpertTargets = {
        freeChlorine: parseFloat(window.targetInputs.freeChlorine.value),
        ph: parseFloat(window.targetInputs.ph.value),
        alkalinity: parseFloat(window.targetInputs.alkalinity.value),
        calcium: parseFloat(window.targetInputs.calcium.value),
        cya: parseFloat(window.targetInputs.cya.value),
        salt: parseFloat(window.targetInputs.salt.value)
    };
    for (const key in rawExpertTargets) {
        if (!isNaN(rawExpertTargets[key])) { // Only include if it's a valid number
            expertCustomTargets[key] = rawExpertTargets[key];
        }
    }
  }
  const standards = getCurrentStandards();
  if (!standards) {
    resultsDiv.innerHTML = `<p class="error">Please select state and pool type.</p>`;
    return;
  }
// Clear previous results
resultsDiv.innerHTML = '';

if (isExpert) {
  // EXPERT MODE: Simplified output
  const EXPERT_PARAM_BACKGROUND_CLASSES = {
    ph: 'ph-red', // Red background for pH
    alkalinity: 'alk-green', // Green background for Alkalinity
    calcium: 'calcium-blue', // Blue background for Calcium
    cya: 'cya-purple', // Purple background for CYA
    freeChlorine: 'chlorine-yellow', // Yellow background for Free Chlorine
    salt: 'other-gray' // Gray background for Salt
};
  let expertHtml = '<h2>Expert Mode - Calculated Dosages</h2>';
  expertHtml += '<ul>';
  let adjustmentCardsHtml = '';
  let adjustmentNeeded = false;

  // 1. Water Balance Parameters (pH, Alkalinity, Calcium, CYA)
  const currentValuesForBalance = {
      cya: values.cya,
      alkalinity: values.alkalinity,
      calcium: values.calcium,
      ph: values.ph
  };

  const expertBalanceTargetsInput = {};
  if (expertCustomTargets.hasOwnProperty('ph')) expertBalanceTargetsInput.ph = expertCustomTargets.ph;
  if (expertCustomTargets.hasOwnProperty('alkalinity')) expertBalanceTargetsInput.alkalinity = expertCustomTargets.alkalinity;
  if (expertCustomTargets.hasOwnProperty('calcium')) expertBalanceTargetsInput.calcium = expertCustomTargets.calcium;
  if (expertCustomTargets.hasOwnProperty('cya')) expertBalanceTargetsInput.cya = expertCustomTargets.cya;

  if (Object.keys(expertBalanceTargetsInput).length > 0) {
      // ---- MODIFICATION START ----
      try {
        const waterBalanceResponse = await fetch('/api/calculate-water-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            poolType: selectedPoolType,
            poolVolume: values.poolVolume,
            current: currentValuesForBalance,
            targets: expertBalanceTargetsInput,
            tempF: values.temperature,
            tds: values.tds
          })
        });

        if (!waterBalanceResponse.ok) {
          const errorData = await waterBalanceResponse.json();
          throw new Error(errorData.error || `Water balance API failed with status: ${waterBalanceResponse.status}`);
        }

        const { steps } = await waterBalanceResponse.json(); // Destructure 'steps' from the API response
        // ---- MODIFICATION END ----

        steps.forEach(step => {
          if (step.dose && expertBalanceTargetsInput.hasOwnProperty(step.key)) {
            adjustmentNeeded = true;
            const unit = step.key === 'ph' ? '' : ' ppm';
            const cardClass = EXPERT_PARAM_BACKGROUND_CLASSES[step.key] || 'other-gray';
            adjustmentCardsHtml += `
              <div class="expert-dosage-card ${cardClass}">
                To adjust <strong>${step.parameter}</strong> from tested value of <strong>${step.current}${unit}</strong> to target of <strong>${step.target}${unit}</strong>:
                <ul><li>${step.dose}</li></ul>
              </div>`;
          }
        });
      } catch (apiError) {
        console.error("Error fetching/processing water balance for expert mode:", apiError);
        adjustmentCardsHtml += `<div class="expert-dosage-card error-card">Could not calculate water balance adjustments: ${apiError.message}</div>`;
      }
    }

// 2. Free Chlorine
if (expertCustomTargets.hasOwnProperty('freeChlorine') && selectedChlorineType) {
  const targetFC = expertCustomTargets.freeChlorine;
  const currentFC = values.freeChlorine;
  if (targetFC > currentFC) {
      const doseLbs = ((targetFC - currentFC) * values.poolVolume * 0.0000834) / selectedChlorineType.concentration;
      if (doseLbs > 0.001) { // Only proceed if dose is significant
          adjustmentNeeded = true;
          let chlorineDoseFormatted = "Error formatting dose.";
          try {
              const doseFormatResponse = await fetch('/api/format-chlorine-dose', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      lbs: doseLbs,
                      poolType: selectedPoolType,
                      chlorineTypeId: selectedChlorineType.id
                  })
              });
              if (!doseFormatResponse.ok) {
                  const errorData = await doseFormatResponse.json();
                  throw new Error(errorData.error || `Format dose API failed: ${doseFormatResponse.status}`);
              }
              const { formattedDose } = await doseFormatResponse.json();
              chlorineDoseFormatted = formattedDose;

          } catch (apiError) {
              console.error("Error fetching formatted chlorine dose for expert mode:", apiError);
              chlorineDoseFormatted = `Could not format dose: ${apiError.message}`;
          }

          const cardClass = EXPERT_PARAM_BACKGROUND_CLASSES['freeChlorine'] || 'other-gray';
          adjustmentCardsHtml += `
          <div class="expert-dosage-card ${cardClass}">
          To adjust <strong>Free Chlorine</strong> from tested value of <strong>${currentFC.toFixed(1)} ppm</strong> to target of <strong>${targetFC.toFixed(1)} ppm</strong>:
          <ul>
          <li>Add ${chlorineDoseFormatted} of ${selectedChlorineType.name}</li>
          </ul>
          </div>
          `;
      }
  } else if (targetFC < currentFC) {
      const cardClass = EXPERT_PARAM_BACKGROUND_CLASSES['freeChlorine'] || 'other-gray';
      adjustmentCardsHtml += `
      <div class="expert-dosage-card ${cardClass}">
      <strong>Free Chlorine</strong> target (<strong>${targetFC.toFixed(1)} ppm</strong>) is below current level (${currentFC.toFixed(1)} ppm). No increase needed. Consider Sodium Thiosulfate if reduction is desired.
      </div>
      `;
  }
}

// 3. Salt
if (expertCustomTargets.hasOwnProperty('salt')) {
  const targetSaltExpert = expertCustomTargets.salt;
  const currentSalt = values.saltLevel;

  if (targetSaltExpert > currentSalt) {
    // --- Salt Dose via API for Expert Mode ---
    try {
      const saltDoseResponse = await fetch('/api/calculate-salt-dose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSalt: currentSalt,
          targetSalt: targetSaltExpert,
          poolVolume: values.poolVolume
        })
      });

      if (!saltDoseResponse.ok) {
        const errorData = await saltDoseResponse.json();
        throw new Error(errorData.error || `Salt Dose API failed: ${saltDoseResponse.status}`);
      }
      const saltDoseApiResult = await saltDoseResponse.json();
      // --- End of Salt Dose API Call ---

      if (saltDoseApiResult && saltDoseApiResult.lbsNeeded > 0) {
        adjustmentNeeded = true;
        // Use the display message from the API, remove parts if necessary
        let saltDoseMessage = saltDoseApiResult.display;
        if (typeof saltDoseMessage === 'string') {
             saltDoseMessage = saltDoseMessage.replace(` to reach ${targetSaltExpert} ppm.`, '')
                                             .replace(` to reach ${targetSaltExpert.toFixed(0)} ppm.`, '');
        } else {
            saltDoseMessage = "Error retrieving salt dose message.";
        }

        const cardClass = EXPERT_PARAM_BACKGROUND_CLASSES['salt'] || 'other-gray';
        adjustmentCardsHtml += `
          <div class="expert-dosage-card ${cardClass}">
            To adjust <strong>Salt Level</strong> from tested value of <strong>${currentSalt} ppm</strong> to target of <strong>${targetSaltExpert} ppm</strong>:
            <ul>
              <li>${saltDoseMessage}</li>
            </ul>
          </div>
        `;
      }
    } catch (apiError) {
      console.error("Error fetching salt dose data for expert mode:", apiError);
      adjustmentCardsHtml += `<div class="expert-dosage-card error-card">Could not calculate salt dose: ${apiError.message}</div>`;
    }
  } else if (targetSaltExpert < currentSalt && targetSaltExpert >= 0) {
    // ... (existing logic for target not above current) ...
  }
}

if (!adjustmentNeeded && Object.keys(expertCustomTargets).length > 0) {
    adjustmentCardsHtml += '<div class="expert-dosage-card other-gray">No dosage adjustments are needed for the specified expert targets, or targets are not above current values requiring addition.</div>';
} else if (Object.keys(expertCustomTargets).length === 0) {
    adjustmentCardsHtml += '<div class="expert-dosage-card other-gray">No custom targets entered in Expert Mode.</div>';
}

expertHtml += adjustmentCardsHtml; // Append all cards
resultsDiv.innerHTML = expertHtml;

} else {
  // STANDARD MODE: Original full results rendering logic
  const currentValuesForBalance = {
    cya: values.cya,
    alkalinity: values.alkalinity,
    calcium: values.calcium,
    ph: values.ph
  };

  let waterBalanceData = { steps: [], notes: [] }; // Default empty data

  try {
    // ---- ADD API CALL FOR WATER BALANCE DATA ----
    const waterBalanceResponse = await fetch('/api/calculate-water-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poolType: selectedPoolType,
        poolVolume: values.poolVolume,
        current: currentValuesForBalance,
        targets: {}, // Standard mode uses goldenNumber targets, handled by server
        tempF: values.temperature,
        tds: values.tds
      })
    });

    if (!waterBalanceResponse.ok) {
      const errorData = await waterBalanceResponse.json();
      throw new Error(errorData.error || `Water balance API failed with status: ${waterBalanceResponse.status}`);
    }
    waterBalanceData = await waterBalanceResponse.json(); // Should be { steps, notes }
    // ---- END OF API CALL ----
  } catch (apiError) {
    console.error("Error fetching/processing water balance for standard mode:", apiError);
    // Display an error message to the user if the API call fails
    standardHtml += `<div class="error-card">Could not calculate water balance recommendations: ${apiError.message}</div>`;
    // You might want to stop further processing or display a partial result
  }
   // --- LSI Calculation via API ---
   let lsiApiData = { lsi: 0, pHf: 0, Tf: 0, CHf: 0, ALKf: 0, CYAf: 0, TDSf: 0 }; // Default
   try {
     const lsiResponse = await fetch('/api/calculate-lsi', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         ph: values.ph,
         tempF: values.temperature,
         calcium: values.calcium,
         alkalinity: values.alkalinity,
         cya: values.cya,
         tds: values.tds
       })
     });
     if (!lsiResponse.ok) {
       const errorData = await lsiResponse.json();
       throw new Error(errorData.error || `LSI API failed with status: ${lsiResponse.status}`);
     }
     lsiApiData = await lsiResponse.json(); // Expects { lsi, pHf, Tf, CHf, ALKf, CYAf, TDSf }
   } catch (apiError) {
     console.error("Error fetching LSI data:", apiError);
     // Handle error, maybe display a message for LSI section
   }
   // --- End of LSI API Call ---

   // --- Salt Dose via API ---
  let saltDoseHTML = '<div class="salt-dose-result"><h4>Salt Addition Recommendation</h4><p>Calculating...</p></div>'; // Default
  try {
  const saltDoseResponse = await fetch('/api/calculate-salt-dose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentSalt: values.saltLevel,
      targetSalt: values.targetSaltLevel, // Standard mode uses the dropdown target
      poolVolume: values.poolVolume
    })
  });
  if (!saltDoseResponse.ok) {
    const errorData = await saltDoseResponse.json();
    throw new Error(errorData.error || `Salt Dose API failed: ${saltDoseResponse.status}`);
  } 
  const saltDoseApiResult = await saltDoseResponse.json();
  saltDoseHTML = `
    <div class="salt-dose-result">
      <h4>Salt Addition Recommendation</h4>
      <p>${saltDoseApiResult.display}</p>
    </div>
  `;
} catch (apiError) {
  console.error("Error fetching salt dose data:", apiError);
  saltDoseHTML = `<div class="salt-dose-result error-card">Could not calculate salt dose: ${apiError.message}</div>`;
}
// --- End of Salt Dose API Call ---


  // --- Warnings ---
  const warnings = getWarnings(values, standards);

  // --- Chlorine Dose Table ---
  let minFC = standards.freeChlorine.min;
  if (standards.freeChlorine.cyaRatio && values.cya > 0) {
      const cyaMin = values.cya * standards.freeChlorine.cyaRatio;
      if (cyaMin > minFC) minFC = cyaMin;
  }
  let maxFC = standards.freeChlorine.max;
  const doseTableHTML = await renderChlorineDoseTable({
      currentFC: values.freeChlorine,
      poolVolume: values.poolVolume,
      chlorineType: selectedChlorineType,
      minFC,
      maxFC,
      increment: 0.5
  });
  const BreakpointChlorinationHTML = await renderBreakpointChlorination({
      freeChlorine: values.freeChlorine,
      totalChlorine: values.totalChlorine,
      poolVolume: values.poolVolume,
      chlorineType: selectedChlorineType
  });
  const todayDosageCardsHTML = renderTodayDosageCards({
      steps: waterBalanceData.steps,
      notes: waterBalanceData.notes,
      BreakpointChlorinationHTML,
      freeChlorine: values.freeChlorine,
      totalChlorine: values.totalChlorine
  });
  const waterBalanceStepsHTML = renderWaterBalanceSteps({
    steps: waterBalanceData.steps,
    notes: waterBalanceData.notes
  });
  const alkDisplayHTML = renderAlkalinityDisplay({
      state: selectedState,
      poolType: selectedPoolType,
      currentAlk: values.alkalinity,
      poolVolume: values.poolVolume
  });
  const calciumDisplayHTML = renderCalciumHardnessDisplay({
      state: selectedState,
      poolType: selectedPoolType,
      currentCH: values.calcium,
      poolVolume: values.poolVolume
  });
  const pHDisplayHTML = renderPhDisplay({
      state: selectedState,
      poolType: selectedPoolType,
      currentPh: values.ph,
      poolVolume: values.poolVolume,
      alkalinity: values.alkalinity
  })
  const CyaDisplayHTML = renderCyaDisplay({
      state: selectedState,
      poolType: selectedPoolType,
      currentCya: values.cya,
      poolVolume: values.poolVolume
  })
  const TdsDisplayHTML = renderTdsDisplay({
      currentTds: values.tds,
      poolVolume: values.poolVolume,
      state: selectedState,
      poolType: selectedPoolType
  })
  const ChlorineScaleDisplayHTML = renderChlorineScaleDisplay({
      state: selectedState,
      poolType: selectedPoolType,
      currentFC: values.freeChlorine,
      cya: values.cya
  });
  const LSIScaleHTML = renderLSIScale(lsiApiData.lsi);
  const LSIComponentsTableHTML = renderLSIComponentsTable(lsiApiData);

  resultsDiv.innerHTML = `
  <h2>Full Details</h2>
      ${todayDosageCardsHTML}
  <details class="compliance-summary-details" closed>
    <summary><strong>Is the Pool Compliant With State Code ?</strong></summary>
    <div class="compliance-summary-table-wrap">
      <div class="state-name"><strong>State:</strong> ${selectedState}</div>
      <table class="compliance-summary-table">
      <thead>
      <tr>
      <th>Parameter</th>
      <th>Current</th>
      <th>Min</th>
      <th>Max</th>
      <th>Status</th>
      </tr>
      </thead>
      <tbody>
      ${[
      {
      label: "Free Chlorine",
      current: values.freeChlorine,
      min: standards.freeChlorine.min,
      max: standards.freeChlorine.max,
      inRange: values.freeChlorine >= standards.freeChlorine.min && values.freeChlorine <= standards.freeChlorine.max && (standards.freeChlorine.cyaRatio && values.cya > 0 ? values.freeChlorine >= values.cya * standards.freeChlorine.cyaRatio : true)
      },
      {
      label: "pH",
      current: values.ph,
      min: standards.pH.min,
      max: standards.pH.max,
      inRange: values.ph >= standards.pH.min && values.ph <= standards.pH.max
      },
      {
      label: "Alkalinity",
      current: values.alkalinity,
      min: standards.alkalinity.min,
      max: standards.alkalinity.max,
      inRange: values.alkalinity >= standards.alkalinity.min && values.alkalinity <= standards.alkalinity.max
      },
      {
      label: "Cyanuric Acid",
      current: values.cya,
      min: standards.cya.min,
      max: standards.cya.max,
      inRange: values.cya >= standards.cya.min && values.cya <= standards.cya.max
      },
      {
      label: "Calcium Hardness",
      current: values.calcium,
      min: standards.calcium ? standards.calcium.min : 'N/A', // Handle if calcium standard not defined
      max: standards.calcium ? standards.calcium.max : 'N/A',
      inRange: standards.calcium ? (values.calcium >= standards.calcium.min && values.calcium <= standards.calcium.max) : true
      }
      ].map(row => `
      <tr class="${row.inRange ? 'compliant' : 'noncompliant'}">
      <td>${row.label}</td>
      <td>${row.current}</td>
      <td>${row.min}</td>
      <td>${row.max}</td>
      <td>${row.inRange ? '<span class="status-ok">&#10003;</span>' : '<span class="status-bad">&#10007;</span>'}</td>
      </tr>
      `).join('')}
      </tbody>
      </table>
      ${warnings.length > 0 ? `<ul class="compliance-warnings">${warnings.map(w => `<li>⚠️ ${w}</li>`).join('')}</ul>` : ''}
    </div>
  </details>
  <details class="water-balance-details" closed>
    <summary><strong>Is My Pool Balanced ?</strong></summary>
    <h2>LSI Scale</h2>
    <div class="water-balance-charts">
      ${LSIScaleHTML}
      ${LSIComponentsTableHTML}
      ${waterBalanceStepsHTML}
    </div>
  </details>
  <details class="sanitizer-details" closed>
    <summary><strong>Does My Pool Need To Be Shocked ?</strong></summary>
    <div class="sanitizer-parameter-charts">
      ${BreakpointChlorinationHTML}
    </div>
  </details>
  <details class="water-balance-details" closed>
    <summary><strong>Water Balance Detail</strong></summary>
    <div class="water-parameter-charts">
      ${pHDisplayHTML}
      ${alkDisplayHTML}
      ${calciumDisplayHTML}
      ${TdsDisplayHTML}
    </div>
  </details>
  <details class="sanitizer-details" closed>
    <summary><strong>Chlorine, CYA, and Manual Dosing Detail</strong></summary>
    <div class="sanitizer-parameter-charts">
      ${ChlorineScaleDisplayHTML}
      ${CyaDisplayHTML}
      ${doseTableHTML}
    </div>
  </details>
  <details class="salt-dose-details" closed>
    <summary><strong>Salt Dose Recommendation</strong></summary>
    <div class="salt-dose-parameter-charts">
      ${saltDoseHTML}
    </div>
  </details>
  `;
}
});
// --- Expert Mode Logic ---
document.addEventListener('DOMContentLoaded', () => {
  // --- Expert Mode DOM lookups ---
  const expertModeCheckbox = document.getElementById('expertMode');
  const expertModeSection = document.getElementById('expertModeSection');
  const targetInputs = {
    freeChlorine: document.getElementById('targetFreeChlorine'),
    ph: document.getElementById('targetPh'),
    alkalinity: document.getElementById('targetAlkalinity'),
    calcium: document.getElementById('targetCalcium'),
    cya: document.getElementById('targetCya'),
    salt: document.getElementById('targetSalt')
  };
  const lsiCurrentDisplay = document.getElementById('lsiCurrentDisplay');
  const lsiTargetDisplay = document.getElementById('lsiTargetDisplay');

  // Check if elements exist before adding event listeners
  if (!expertModeCheckbox || !expertModeSection) {
    console.error('Expert Mode elements not found');
    return;
  }

  // Show/hide expert mode section
  expertModeCheckbox.addEventListener('change', () => {
    console.log('Expert mode checkbox changed:', expertModeCheckbox.checked);
    console.log('Expert mode section element:', expertModeSection);
    
    expertModeSection.style.display = expertModeCheckbox.checked ? 'block' : 'none';
    
    if (expertModeCheckbox.checked) {
      console.log('Expert mode enabled, pre-filling values');
      // Pre-fill with current golden numbers or last used targets
      const poolType = selectedPoolType || 'pool';
      console.log('Pool type:', poolType);
      console.log('Golden numbers:', goldenNumbers);
      
      const golden = goldenNumbers ? goldenNumbers[poolType] : {
        freeChlorine: 2,
        ph: 7.5,
        alkalinity: 90,
        calcium: 300,
        cya: 30,
        salt: 0
      };
      
      console.log('Using golden numbers:', golden);
      
      targetInputs.freeChlorine.value = golden.freeChlorine;
      targetInputs.ph.value = golden.ph;
      targetInputs.alkalinity.value = golden.alkalinity;
      targetInputs.calcium.value = golden.calcium;
      targetInputs.cya.value = golden.cya;
      targetInputs.salt.value = golden.salt || 0;
      updateLSIDisplay();
    }
  });
  // Update LSI displays when any target or current value changes
  Object.values(targetInputs).forEach(input => {
    if (input) input.addEventListener('input', updateLSIDisplay);
  });
  [
    document.getElementById('ph'),
    document.getElementById('alkalinity'),
    document.getElementById('calcium'),
    document.getElementById('cya'),
    document.getElementById('tds'),
    document.getElementById('temperature')
  ].forEach(input => {
    if (input) input.addEventListener('input', updateLSIDisplay);
  });

  // Debounce function
  let debounceTimer;
  function debounce(func, delay) {
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
  }

  // MODIFIED updateLSIDisplay to use API
  async function updateLSIDisplay() {
    // Get current values from main form inputs
    const currentParams = {
      ph: parseFloat(document.getElementById('ph').value) || 0,
      alkalinity: parseFloat(document.getElementById('alkalinity').value) || 0,
      calcium: parseFloat(document.getElementById('calcium').value) || 0,
      cya: parseFloat(document.getElementById('cya').value) || 0,
      tds: parseFloat(document.getElementById('tds').value) || 1000, // Default TDS if not entered
      tempF: parseFloat(document.getElementById('temperature').value) || 77 // Default temp if not entered
    };
    // Get target values from expert mode inputs
    const targetParams = {
      ph: parseFloat(targetInputs.ph.value) || 0,
      alkalinity: parseFloat(targetInputs.alkalinity.value) || 0,
      calcium: parseFloat(targetInputs.calcium.value) || 0,
      cya: parseFloat(targetInputs.cya.value) || 0,
      tds: currentParams.tds, // Assume TDS and Temp don't have separate targets in expert LSI preview
      tempF: currentParams.tempF
    };

    try {
      // Fetch LSI for current parameters
      if (lsiCurrentDisplay) lsiCurrentDisplay.textContent = 'Calculating...';
      const currentLsiResponse = await fetch('/api/calculate-lsi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentParams)
      });
      if (currentLsiResponse.ok) {
        const currentLsiData = await currentLsiResponse.json();
        if (lsiCurrentDisplay) lsiCurrentDisplay.textContent = currentLsiData.lsi.toFixed(2);
      } else {
        if (lsiCurrentDisplay) lsiCurrentDisplay.textContent = 'Error';
      }

      // Fetch LSI for target parameters
      if (lsiTargetDisplay) lsiTargetDisplay.textContent = 'Calculating...';
      const targetLsiResponse = await fetch('/api/calculate-lsi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetParams)
      });
      if (targetLsiResponse.ok) {
        const targetLsiData = await targetLsiResponse.json();
        if (lsiTargetDisplay) lsiTargetDisplay.textContent = targetLsiData.lsi.toFixed(2);
      } else {
        if (lsiTargetDisplay) lsiTargetDisplay.textContent = 'Error';
      }
    } catch (error) {
      console.error("Error updating LSI display:", error);
      if (lsiCurrentDisplay) lsiCurrentDisplay.textContent = 'Error';
      if (lsiTargetDisplay) lsiTargetDisplay.textContent = 'Error';
    }
  }

  // Make variables available globally for form submission
  window.expertModeCheckbox = expertModeCheckbox;
  window.targetInputs = targetInputs;
});

// --- Sodium Thiosulfate (Chlorine Neutralizer) Calculator ---

// Modal open/close logic
const openThioCalcBtn = document.getElementById('openThioCalc');
const thioCalcModal = document.getElementById('thioCalcModal');
const closeThioCalcBtn = document.getElementById('closeThioCalc');
const thioForm = document.getElementById('thioForm');
const thioResults = document.getElementById('thioResults');

openThioCalcBtn.addEventListener('click', () => {
  thioCalcModal.style.display = 'flex';
});
closeThioCalcBtn.addEventListener('click', () => {
  thioCalcModal.style.display = 'none';
  thioResults.innerHTML = '';
  thioForm.reset();
});
thioCalcModal.addEventListener('click', (e) => {
  if (e.target === thioCalcModal) {
    thioCalcModal.style.display = 'none';
    thioResults.innerHTML = '';
    thioForm.reset();
  }
});
async function renderThioTableFromServer(currentFC, poolVolume, thioResultsElement) {
  let html = `
    <div style="background:#fffde7;border-left:5px solid #fbc02d;padding:12px 18px;margin-bottom:1em;border-radius:7px;">
      <strong>Note:</strong> Sodium thiosulfate can take up to two hours to work. Add <b>half</b> the required dose, wait two hours, and retest. If needed, add the remaining amount.
    </div>
    <h4>Dose Table (Sodium Thiosulfate Needed)</h4>
    <table class="dose-table" style="margin-top:1em;">
      <thead>
        <tr>
          <th>Target FC (ppm)</th>
          <th>Ounces Needed<br><span style="font-weight:normal;font-size:0.95em;">(dry oz, lbs &amp; oz)</span></th>
        </tr>
      </thead>
      <tbody>
  `;
  try {
    const response = await fetch('/api/calculate-thiosulfate-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentFC, poolVolume })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Thiosulfate table API failed: ${response.status}`);
    }

    const { tableRows } = await response.json();

    if (tableRows && tableRows.length > 0) {
        tableRows.forEach(row => {
            html += `<tr><td>${row.targetFCDisplay}</td><td>${row.doseDisplay}</td></tr>`;
        });
    } else {
        html += `<tr><td colspan="2">No chlorine reduction needed or current FC is already low.</td></tr>`;
    }

  } catch (error) {
    console.error("Error fetching thiosulfate table data:", error);
    html += `<tr><td colspan="2" style="color:red;">Error loading dose information: ${error.message}</td></tr>`;
  }

  html += `</tbody></table>
    <div style="margin-top:1em;font-size:0.98em;color:#757575;">
    <em>Always retest pH and alkalinity after treatment.</em>
    </div>
  `;
  thioResultsElement.innerHTML = html; // Update the specific results element
}

// Form submit handler - MODIFIED
thioForm.addEventListener('submit', async function(e) { // Made async
  e.preventDefault();
  const poolVolume = parseFloat(document.getElementById('thioPoolVolume').value);
  const currentFC = parseFloat(document.getElementById('thioCurrentFC').value);
  const ph = parseFloat(document.getElementById('thioPH').value); // Keep pH for client-side warning

  // Clear previous results first
  thioResults.innerHTML = '<p>Calculating...</p>';

  // pH warning (remains client-side)
  let warning = '';
  if (ph < 7.2) {
    warning = `<div style="color:#b71c1c;font-weight:bold;margin-bottom:0.7em;">Warning: pH is already low. Sodium thiosulfate may lower pH further. Adjust pH before neutralizing chlorine.</div>`;
  }
  

  thioResults.innerHTML = warning;
  await renderThioTableFromServer(currentFC, poolVolume, thioResults);
});
