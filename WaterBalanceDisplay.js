import { getWaterBalanceSteps } from './WaterBalanceUtils.js';

// Color classes for each parameter
const PARAM_COLORS = {
  cya: 'cya-purple',
  alkalinity: 'alk-green',
  calcium: 'calcium-blue',
  ph: 'ph-red'
};

/**
 * Render a table of water balance steps (dosing order, current, target, dose).
 * @param {object} params
 * @param {string} poolType - 'pool' or 'spa'
 * @param {number} poolVolume - gallons
 * @param {object} current - { cya, alkalinity, calcium, ph }
 * @param {object} [targets] - optional custom targets
 * @param {number} [tempF] - water temperature (F)
 * @param {number} [tds] - total dissolved solids (ppm)
 * @returns {string} HTML
 */
export function renderWaterBalanceSteps({ poolType, poolVolume, current, targets = {}, tempF = 77, tds = 1000 }) {
  const { steps, notes } = getWaterBalanceSteps({ poolType, poolVolume, current, targets, tempF, tds });

  // Filter to only water balance parameters (excluding pH)
  const waterBalanceSteps = steps.filter(step => ['alkalinity', 'calcium', 'cya'].includes(step.key));

  // Determine which parameters are out of range for the summary
  const outOfRangeSteps = waterBalanceSteps.filter(step => {
    return step.current < step.target || step.current > step.target;
  });

  // Water Balance Plan Summary
  const planSummary = outOfRangeSteps.length
    ? `<div class="water-balance-plan-summary" style="margin-bottom:1em;">
    Adjust chemicals in the order shown above for best results. Adjust one parameter per day, preferably before the pool opens or right after it closes.<br>
    <ol>
    ${outOfRangeSteps.map((step, idx) =>
    `<li>Day ${idx + 1}: <span class="${PARAM_COLORS[step.key]}">${step.parameter}</span></li>`
    ).join('')}
    </ol>
    </div>`
    : `<div class="water-balance-plan-summary" style="margin-bottom:1em;">
    <strong>Water Balance Plan Summary:</strong> All parameters are within target range.
    </div>`;

  // Create day counter for parameters that need doses
  let dayCounter = 0;

  // Helper function to format values with appropriate units
  function formatValueWithUnits(value, parameterKey) {
    if (value === undefined || value === null) return '-';
    
    // Add "ppm" for alkalinity, calcium, and cya parameters
    if (['alkalinity', 'calcium', 'cya'].includes(parameterKey)) {
      return `${value} ppm`;
    }
    
    // Return value as-is for pH (no units needed)
    return value;
  }

  // Table with color classes
  return `
    <style>
    .cya-purple { color: #8e24aa; font-weight: bold; }
    .alk-green { color: #388e3c; font-weight: bold; }
    .calcium-blue { color: #1976d2; font-weight: bold; }
    .ph-red { color: #d32f2f; font-weight: bold; }
    .dose-table tr.cya-purple td, .dose-table tr.cya-purple th { background: #f3e5f5; }
    .dose-table tr.alk-green td, .dose-table tr.alk-green th { background: #e8f5e9; }
    .dose-table tr.calcium-blue td, .dose-table tr.calcium-blue th { background: #e3f2fd; }
    .dose-table tr.ph-red td, .dose-table tr.ph-red th { background: #ffebee; }
    </style>
    <div class="section water-balance-steps">
    <h3>Water Balance Adjustment Steps</h3>
    ${planSummary}
    <table class="dose-table">
    <thead>
    <tr>
    <th>Day</th>
    <th>Parameter</th>
    <th>Current</th>
    <th>Target</th>
    <th>Dose Needed</th>
    </tr>
    </thead>
    <tbody>
    ${waterBalanceSteps.map((step) => {
    // Only increment day counter if dose is needed
    const needsDose = step.dose && step.dose !== null;
    if (needsDose) {
    dayCounter++;
    }
    
    return `
    <tr class="${PARAM_COLORS[step.key] || ''}">
    <td>${needsDose ? dayCounter : '-'}</td>
    <td><span class="${PARAM_COLORS[step.key] || ''}">${step.parameter}</span></td>
    <td>${formatValueWithUnits(step.current, step.key)}</td>
    <td>${formatValueWithUnits(step.target, step.key)}</td>
    <td>${step.dose ? `<span class="dose">${step.dose}</span>` : '<em>None needed</em>'}</td>
    </tr>
    `;
    }).join('')}
    </tbody>
    </table>
    ${notes && notes.length > 0 ? `
    <div class="water-balance-notes" style="margin-top:1em;color:#b71c1c;">
    <strong>Note:</strong>
    <ul>
    ${notes.map(n => `<li>${n}</li>`).join('')}
    </ul>
    </div>
    ` : ''}
    <div style="margin-top:0.7em;font-size:0.98em;color:#757575;">
    </div>
    </div>
  `;
}