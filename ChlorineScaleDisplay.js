import { poolStandards } from '../config.js';

export function renderChlorineScaleDisplay({
  state,
  poolType,
  currentFC,
  cya
}) {
  const standards = poolStandards[state]?.[poolType];
  if (!standards || !standards.freeChlorine) {
    return `<div class="chlorine-analysis-container"><div class="chlorine-analysis-heading">Chlorine Analysis</div>
    <div style="color:red;">Chlorine standards not defined for this state/pool type.</div></div>`;
  }

  // Defensive: ensure numbers
  currentFC = typeof currentFC === 'number' && !isNaN(currentFC) ? currentFC : 0;
  cya = typeof cya === 'number' && !isNaN(cya) ? cya : 0;

  
 // State min/max
  const min = 0;
  const stateMin = standards.freeChlorine.min;
  const stateMax = standards.freeChlorine.max;
  const max = Math.max(stateMax + 2, (cya * (standards.freeChlorine.cyaRatio || 0.05)) + 2, currentFC + 2);

  // CYA-based minimum
  const cyaMin = cya * (standards.freeChlorine.cyaRatio || 0.05);

  // Calculate positions as percent of the scale
  const percent = v => ((v - min) / (max - min)) * 100;
  const stateMinPercent = percent(stateMin);
  const stateMaxPercent = percent(stateMax);
  const cyaMinPercent = percent(cyaMin);
  const currentPercent = percent(currentFC);

  // Tick marks (every 0.5 ppm)
  const ticks = [];
  for (let t = min; t <= max + 0.001; t += 0.5) {
    ticks.push(Number(t.toFixed(2)));
  }

  return `
   <style>
    .chlorine-analysis-container {
      margin-bottom: 48px;
    }
    .chlorine-analysis-heading {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 32px;
      color: #fbc02d;
      letter-spacing: 0.5px;
    }
    .chlorine-scale-bar {
      position: relative;
      height: 32px;
      background: #fffde7;
      border-radius: 8px;
      margin: 40px 0 16px 0;
      box-shadow: 0 1px 2px #0001;
      overflow: visible;
    }
    .chlorine-range.acceptable {
      position: absolute;
      top: 0; left: ${stateMinPercent}%;
      width: ${stateMaxPercent - stateMinPercent}%;
      height: 100%;
      background: #ffe082;
      z-index: 1;
      border-radius: 8px;
    }
    .chlorine-marker {
      position: absolute;
      width: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }
    .chlorine-marker-label {
      font-size: 0.7em;
      color: #333;
      background: #fffde7;
      padding: 1px 4px;
      border-radius: 4px;
      margin-bottom: 2px;
      white-space: nowrap;
      font-weight: bold;
      border: 1px solid #ffe082;
      margin-bottom: 4px;
    }
    .chlorine-x {
      font-size: 1.5em;
      color: #111;
      font-weight: bold;
      line-height: 1;
      margin-bottom: 0;
      font-family: 'Segoe UI', Arial, sans-serif;
      display: block;
    }
    .chlorine-arrow {
      font-size: 1.5em;
      color: #111;
      line-height: 1;
      margin-bottom: 0;
    }
    .chlorine-marker.cya-min {
      left: ${cyaMinPercent}%;
      top: -38px;
    }
    .chlorine-marker.current {
      left: ${currentPercent}%;
      top: -38px;
    }
    .chlorine-ticks {
      position: relative;
      height: 24px;
      margin-top: 6px;
      width: 100%;
    }
    .chlorine-tick {
      position: absolute;
      top: 0;
      width: 2px;
      height: 10px;
      background: #fbc02d;
      z-index: 10;
    }
    .chlorine-tick-label {
      position: absolute;
      top: 12px;
      font-size: 0.95em;
      color: #fbc02d;
      transform: translateX(-50%);
      white-space: nowrap;
      z-index: 10;
    }
    .chlorine-annotation-row {
      position: relative;
      width: 100%;
      height: 24px;
      margin-top: 2px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      pointer-events: none;
    }
    .chlorine-annotation.acceptable {
      position: absolute;
      display: flex;
      align-items: center;
      font-size: 0.7125em;
      font-weight: bold;
      background: transparent;
      color: #fbc02d;
      gap: 4px;
      pointer-events: none;
      height: 24px;
      line-height: 1;
      left: ${stateMinPercent}%;
      width: ${stateMaxPercent - stateMinPercent}%;
      justify-content: center;
    }
    .chlorine-results-row {
      display: flex;
      justify-content: flex-start;
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
    @media (max-width: 600px) {
      .chlorine-results-row {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
      }
      .chlorine-analysis-container {
        margin-bottom: 32px;
      }
    }
    </style>
    <div class="chlorine-analysis-container">
      <div class="chlorine-analysis-heading">Chlorine Analysis</div>
      <div class="chlorine-scale-bar">
        <div class="chlorine-range acceptable"></div>
        <div class="chlorine-marker cya-min" style="left:${cyaMinPercent}%; top:-38px;">
          <div class="chlorine-marker-label">CYA Min FC<br>(${cyaMin.toFixed(2)} ppm)</div>
          <span class="chlorine-x">&#10005;</span>
        </div>
        <div class="chlorine-marker current" style="left:${currentPercent}%; top:-38px;">
          <div class="chlorine-marker-label">Current FC<br>(${currentFC.toFixed(2)} ppm)</div>
          <span class="chlorine-arrow">&#8595;</span>
        </div>
      </div>
      <div class="chlorine-ticks">
        ${ticks.map(tick => `
          <div class="chlorine-tick" style="left:${percent(tick)}%;"></div>
          <div class="chlorine-tick-label" style="left:${percent(tick)}%;">${tick}</div>
        `).join('')}
      </div>
      <div class="chlorine-annotation-row" style="margin-top: 8px;">
        <div class="chlorine-annotation acceptable"
          style="left:${stateMinPercent}%;width:${stateMaxPercent - stateMinPercent}%;">
          Acceptable Range
        </div>
      </div>
      <div class="chlorine-results-row">
        <div class="current-value">Current Free Chlorine: <strong>${currentFC.toFixed(2)} ppm</strong></div>
        <div class="current-value">CYA-based Minimum: <strong>${cyaMin.toFixed(2)} ppm</strong></div>
      </div>
    </div>
  `;
}
 