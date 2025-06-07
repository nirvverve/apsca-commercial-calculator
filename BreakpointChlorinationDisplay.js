import { getBreakpointChlorination } from './BreakpointChlorinationUtils.js';

/**
 * Render breakpoint chlorination recommendation and dose.
 * @param {object} params
 * @param {number} freeChlorine
 * @param {number} totalChlorine
 * @param {number} poolVolume
 * @param {object} chlorineType
 * @returns {string} HTML
 */
export function renderBreakpointChlorination({
  freeChlorine,
  totalChlorine,
  poolVolume,
  chlorineType
}) {
  const result = getBreakpointChlorination({
    freeChlorine,
    totalChlorine,
    poolVolume,
    chlorineType
  });

  return `
    <div class="section breakpoint-chlorination">
      <h3>Breakpoint Chlorination (Shock)</h3>
      <table class="dose-table">
        <tr>
          <th>Combined Chlorine</th>
          <td>${result.combinedChlorine} ppm</td>
        </tr>
        <tr>
          <th>Breakpoint Target</th>
          <td>${result.ppmNeeded > 0 ? (parseFloat(result.combinedChlorine) * 10).toFixed(2) + ' ppm' : '-'}</td>
        </tr>
        <tr>
          <th>Chlorine Dose Needed</th>
          <td><span class="breakpoint-dose">${result.doseText || '-'}</td>
        </tr>
      </table>
      <div style="margin-top:0.7em;font-size:1em;color:#1976d2;">
        <strong>${result.recommendation}</strong>
      </div>
    </div>
  `;
}