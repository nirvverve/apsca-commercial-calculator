/**
 * Render breakpoint chlorination recommendation and dose.
 * @param {object} params
 * @param {number} freeChlorine
 * @param {number} totalChlorine
 * @param {number} poolVolume
 * @param {object} chlorineType
 * @returns {string} HTML 
 */
export async function renderBreakpointChlorination({
  freeChlorine,
  totalChlorine,
  poolVolume,
  chlorineType
}) {
  try {
    console.log("Client sending chlorineType to /api/calculate-breakpoint:", JSON.stringify(chlorineType, null, 2));
    const response = await fetch('/api/calculate-breakpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ // Send data as JSON
        freeChlorine,
        totalChlorine,
        poolVolume,
        chlorineType
      }),
    });

    if (!response.ok) {
      // Handle server errors (e.g., if the server endpoint has an issue)
      const errorData = await response.json();
      console.error('Server error for breakpoint calc:', errorData.error || response.statusText);
      return `<div class="section breakpoint-chlorination error"><p>Error calculating breakpoint: ${errorData.error || response.statusText}</p></div>`;
    }

    const result = await response.json(); // Get the result from the server

    // Now use the 'result' object from the server to build the HTML
    // This part is similar to what you had before
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
      <td>${parseFloat(result.ppmNeeded) > 0 ? (parseFloat(result.combinedChlorine) * 10).toFixed(2) + ' ppm' : '-'}</td>
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
  } catch (error) {
    // Handle network errors or issues with the fetch call itself
    console.error('Fetch error for breakpoint calc:', error);
    return `<div class="section breakpoint-chlorination error"><p>Error fetching breakpoint data: ${error.message}</p></div>`;
  }
}