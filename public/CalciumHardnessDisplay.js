import { poolStandards } from '../config.js';

// Helper to calculate calcium chloride dose (to raise calcium hardness)
function calculateCalciumDose(current, target, poolVolume) {
  if (target <= current) return 0;
  const ppmIncrease = target - current;
  // Dose in lbs = (ppmIncrease / 10) * 1.25 * (poolVolume / 10000)
  return ((ppmIncrease / 10) * 1.25 * (poolVolume / 10000));
}

export function renderCalciumHardnessDisplay({
  state,
  poolType,
  currentCH,
  poolVolume
}) {
  // Get standards for this state/poolType
  const standards = poolStandards[state][poolType];
  const min = 0;
  const max = 1000;

  // Define ranges for display
  const acceptableRange = { min: 200, max: 800 };
  const idealRange = { min: 300, max: 500 };

  // For dose recommendations, use 300, 400, and 500 ppm as targets
  const dose300 = calculateCalciumDose(currentCH, 300, poolVolume);
  const dose400 = calculateCalciumDose(currentCH, 400, poolVolume);
  const dose500 = calculateCalciumDose(currentCH, 500, poolVolume);

  // Defensive: ensure number
  currentCH = typeof currentCH === 'number' && !isNaN(currentCH) ? currentCH : 0;

  // Calculate positions as percent of the scale
  const percent = v => ((v - min) / (max - min)) * 100;
  const markerPercent = Math.min(100, Math.max(0, percent(currentCH)));
  const acceptableStart = percent(acceptableRange.min);
  const acceptableWidth = percent(acceptableRange.max) - acceptableStart;
  const idealStart = percent(idealRange.min);
  const idealWidth = percent(idealRange.max) - idealStart;

  // Tick marks: every 100 ppm from 0 to 1000
  const ticks = [];
  for (let t = 0; t <= 1000; t += 100) {
    ticks.push(t);
  }

  // Bar heights
  const barHeight = 16; // px, half of the scale bar height (32px)
  const barGap = 4;     // px, vertical gap between bars

  return `
    <style>
      .calcium-analysis-container {
        margin-bottom: 48px;
      }
      .calcium-analysis-heading {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 32px;
        color: #1565c0;
        letter-spacing: 0.5px;
      }
      .calcium-scale-bar {
        position: relative;
        height: 32px;
        background: #e3f2fd;
        border-radius: 8px;
        margin: 40px 0 16px 0;
        box-shadow: 0 1px 2px #0001;
        overflow: visible;
      }
      .calcium-range.acceptable {
        position: absolute;
        top: ${16 + barGap}px; /* lower half of the bar, with gap */
        left: ${acceptableStart}%;
        width: ${acceptableWidth}%;
        height: ${barHeight}px;
        background: #90caf9;
        z-index: 2;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .calcium-range.ideal {
        position: absolute;
        top: 0;
        left: ${idealStart}%;
        width: ${idealWidth}%;
        height: ${barHeight}px;
        background: #1565c0;
        opacity: 0.7;
        z-index: 3;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .calcium-marker {
        position: absolute;
        left: ${markerPercent}%;
        top: -38px;
        width: 0;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
      }
      .calcium-marker-label {
        font-size: 0.7em;
        color: #fff;
        background: #1565c0;
        padding: 1px 8px;
        border-radius: 4px;
        margin-bottom: 4px;
        white-space: nowrap;
        font-weight: bold;
        border: 1px solid #1565c0;
        box-shadow: 0 1px 2px #0002;
      }
      .calcium-arrow {
        font-size: 1.8em;
        color: #111;
        line-height: 2;
        margin-bottom: 0;
      }
      .calcium-ticks {
        position: relative;
        height: 24px;
        margin-top: 6px;
        width: 100%;
      }
      .calcium-tick {
        position: absolute;
        top: 0;
        width: 2px;
        height: 10px;
        background: #1976d2;
        z-index: 10;
      }
      .calcium-tick-label {
        position: absolute;
        top: 12px;
        font-size: 0.95em;
        color: #1565c0;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 10;
      }
      .calcium-annotation-row {
        position: relative;
        width: 100%;
        height: 2px;
        margin-top: 2px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        pointer-events: none;
      }
      .calcium-annotation {
        position: absolute;
        display: flex;
        align-items: center;
        font-size: 0.7125em;
        font-weight: bold;
        background: transparent;
        gap: 4px;
        pointer-events: none;
        height: 16px;
        line-height: 1;
        justify-content: center;
      }
      .calcium-annotation.ideal {
        color: #fff;
        background: #1565c0;
        left: ${idealStart}%;
        width: ${idealWidth}%;
        border-radius: 4px;
        justify-content: center;
        padding: 2px 8px;
        top: 0;
        z-index: 4;
      }
      .calcium-annotation.acceptable {
        color: #fff;
        background: #90caf9;
        left: ${acceptableStart}%;
        width: ${acceptableWidth}%;
        border-radius: 4px;
        justify-content: center;
        padding: 2px 8px;
        top: ${barHeight + barGap}px;
        z-index: 4;
      }
      .calcium-results-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 32px;
        margin-top: 24px;
        flex-wrap: wrap;
      }
      .current-value {
        font-size: 0.8em;
        color: #333;
        font-weight: bold;
        min-width: 180px;
      }
      .dose-recommendations {
        font-size: 0.8em;
        color: #333;
        min-width: 220px;
      }
      @media (max-width: 600px) {
        .calcium-results-row {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }
        .calcium-analysis-container {
          margin-bottom: 32px;
        }
      }
    </style>
    <div class="calcium-analysis-container">
      <div class="calcium-analysis-heading">Calcium Hardness Analysis</div>
      <div class="calcium-scale-bar">
        <div class="calcium-range ideal"></div>
        <div class="calcium-range acceptable"></div>
        <div class="calcium-marker">
          <div class="calcium-marker-label">${currentCH} ppm</div>
          <span class="calcium-arrow">&#8595;</span>
        </div>
      </div>
      <div class="calcium-ticks">
        ${ticks.map(tick => `
          <div class="calcium-tick" style="left:${percent(tick)}%;"></div>
          <div class="calcium-tick-label" style="left:${percent(tick)}%;">${tick}</div>
        `).join('')}
      </div>
      <div class="calcium-annotation-row" style="margin-top: 8px;">
        <div class="calcium-annotation ideal"
          style="left:${idealStart}%;width:${idealWidth}%;top:0;">
          Ideal Range
        </div>
      </div>
      <div class="calcium-annotation-row" style="margin-top: ${barHeight + barGap + 8}px;">
        <div class="calcium-annotation acceptable"
          style="left:${acceptableStart}%;width:${acceptableWidth}%;top:0;">
          Acceptable Range
        </div>
      </div>
      <div class="calcium-results-row">
        <div class="current-value">Current Calcium Hardness: <strong>${currentCH} ppm</strong></div>
        <div class="dose-recommendations">
          <div>To reach <strong>300 ppm</strong>: <span class="dose">${dose300 > 0 ? dose300.toFixed(2) + ' lbs calcium chloride' : 'No dose needed'}</span></div>
          <div>To reach <strong>400 ppm</strong>: <span class="dose">${dose400 > 0 ? dose400.toFixed(2) + ' lbs calcium chloride' : 'No dose needed'}</span></div>
          <div>To reach <strong>500 ppm</strong>: <span class="dose">${dose500 > 0 ? dose500.toFixed(2) + ' lbs calcium chloride' : 'No dose needed'}</span></div>
        </div>
      </div>
    </div>
  `;
}