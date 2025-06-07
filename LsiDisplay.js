// Provides rendering functions for the Langelier Saturation Index (LSI) scale and components table

import { goldenNumbers } from './config.js';

/**
 * Render the LSI horizontal scale/graph.
 * @param {number} lsi - The calculated LSI value.
 * @returns {string} - HTML string for the LSI scale.
 */
export function renderLSIScale(lsi) {
    // Tightened LSI range: -0.6 (corrosive) to +0.6 (scaling) for better resolution
    const min = -0.6, max = 0.6;
    const percent = Math.max(0, Math.min(100, ((lsi - min) / (max - min)) * 100));
    
    // Determine water condition description and color (unified color scheme)
    let conditionText = "";
    let conditionColor = "";
    
    if (lsi < -1.0) {
        conditionText = "very corrosive";
        conditionColor = "#b71c1c"; // dark red
    } else if (lsi >= -1.0 && lsi <= -0.50) {
        conditionText = "corrosive";
        conditionColor = "#d32f2f"; // red
    } else if (lsi >= -0.49 && lsi <= -0.30) {
        conditionText = "slightly corrosive";
        conditionColor = "#f57c00"; // orange-red
    } else if (lsi >= -0.30 && lsi <= 0.30) {
        conditionText = "balanced";
        conditionColor = "#388e3c"; // green
    } else if (lsi >= 0.31 && lsi <= 0.49) {
        conditionText = "slightly scaling";
        conditionColor = "#1976d2"; // light blue
    } else if (lsi >= 0.50 && lsi <= 1.00) {
        conditionText = "scaling";
        conditionColor = "#0d47a1"; // blue
    } else if (lsi > 1.00) {
        conditionText = "very scaling";
        conditionColor = "#1a237e"; // dark blue
    }

    // Use the same color for both the indicator and the text
    const indicatorColor = conditionColor;

    return `
    <div class="lsi-scale-container">
        <div class="lsi-scale-labels">
            <span>Corrosive (-0.6)</span>
            <span>Balanced (0.0)</span>
            <span>Scaling (+0.6)</span>
        </div>
        <div class="lsi-scale-bar" style="margin-top: 1.5em;">
            <div class="lsi-scale-bar-bg"></div>
            <div class="lsi-scale-bar-indicator" style="left: ${percent}%; background: ${indicatorColor};"></div>
            <div class="lsi-scale-value" style="left: ${percent}%;">
                ${lsi.toFixed(2)}
            </div>
        </div>
        <div class="lsi-condition-description" style="text-align: center; margin-top: 1.5em; font-size: 1.2em; font-weight: bold;">
            Currently the pool water is <span style="color: ${conditionColor}; font-weight: bold;">${conditionText}</span>
        </div>
    </div>
    `;
}

/**
 * Render the LSI components summary table.
 * The "Golden Number" is the ideal/target value for each parameter, taken from config.js for the selected state and pool type.
 * @param {object} factors - Object containing LSI components and their factors.
 * @param {string} state - Selected state (e.g., "Arizona").
 * @param {string} poolType - Selected pool type ("pool" or "spa").
 * @returns {string} - HTML string for the LSI components table.
 */
export function renderLSIComponentsTable(factors, state, poolType) {
    // Fallback to 'pool' if poolType is not provided
    const type = poolType || 'pool';
    // Get golden numbers for the selected pool type
    const golden = (goldenNumbers[type]) ? goldenNumbers[type] : goldenNumbers['pool'];

    // Helper function to determine direction and arrow
    function getDirectionArrow(current, target, paramKey) {
        // Exclude temperature and TDS from direction arrows
        if (paramKey === 'temp' || paramKey === 'tds') {
            return '-';
        }
        
        if (current < target) {
            return '<span style="color: #1976d2; font-size: 1.7em; font-weight: bold;">↑</span>'; // Blue up arrow
        } else if (current > target) {
            return '<span style="color: #d32f2f; font-size: 1.7em; font-weight: bold;">↓</span>'; // rec down arrow
        } else {
            return '<span style="color: #388e3c; font-size: 1.7em; font-weight: bold;">✓</span>'; // Green checkmark
        }
    }

    return `
    <table class="lsi-components-table">
    <thead>
    <tr>
    <th>Component</th>
    <th>Tested</th>
    <th>Ideal Value</th>
    <th>Direction</th>
    </tr>
    </thead>
    <tbody>
    <tr class="field-ph">
    <td>pH</td>
    <td>${factors.ph}</td>
    <td>${golden.ph}</td>
    <td>${getDirectionArrow(factors.ph, golden.ph, 'ph')}</td>
    </tr>
    <tr class="field-alk">
    <td>Total Alkalinity</td>
    <td>${factors.alk} ppm</td>
    <td>${golden.alkalinity} ppm</td>
    <td>${getDirectionArrow(factors.alk, golden.alkalinity, 'alk')}</td>
    </tr>
    <tr class="field-ch">
    <td>Calcium Hardness</td>
    <td>${factors.calcium} ppm</td>
    <td>${golden.calcium} ppm</td>
    <td>${getDirectionArrow(factors.calcium, golden.calcium, 'calcium')}</td>
    </tr>
    <tr class="field-temp">
    <td>Temperature (°F)</td>
    <td>${factors.tempF}</td>
    <td>84</td>
    <td>-</td>
    </tr>
    <tr class="field-tds">
    <td>TDS (ppm)</td>
    <td>${factors.tds} ppm</td>
    <td>1000 ppm</td>
    <td>-</td>
    </tr>
    <tr class="field-cya">
    <td>Cyanuric Acid</td>
    <td>${factors.cya} ppm</td>
    <td>${golden.cya} ppm</td>
    <td>${getDirectionArrow(factors.cya, golden.cya, 'cya')}</td>
    </tr>
    </tbody>
    </table>
    <div style="margin-top: 0.5em; font-size: 0.85em; font-style: italic; color: #666;">
        *Alkalinity used for LSI to correct for CYA: ${factors.correctedAlk.toFixed(1)} ppm
    </div>
    `;
}