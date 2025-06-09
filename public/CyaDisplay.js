import { poolStandards } from '../config.js';

export function renderCyaDisplay({
  state,
  poolType,
  currentCya,
  poolVolume
}) {
  // Get standards for this state/poolType
  const standards = poolStandards[state]?.[poolType];
  if (!standards || !standards.cya || typeof standards.cya.min !== 'number' || typeof standards.cya.max !== 'number') {
    return `<div class="cya-analysis-container"><div class="cya-analysis-heading">Cyanuric Acid (CYA) Analysis</div>
      <div style="color:red;">CYA standards not defined for this state/pool type.</div></div>`;
  }
  const min = 0;
  const max = 150;

  // Use state-specific acceptable range
  const acceptableRange = {
    min: standards.cya.min,
    max: standards.cya.max
  };

  // Defensive: ensure number
  currentCya = typeof currentCya === 'number' && !isNaN(currentCya) ? currentCya : 0;

  // Calculate positions as percent of the scale
  const percent = v => ((v - min) / (max - min)) * 100;
  const markerPercent = Math.min(100, Math.max(0, percent(currentCya)));
  const acceptableStart = percent(acceptableRange.min);
  const acceptableWidth = percent(acceptableRange.max) - acceptableStart;

  // Tick marks (every 20 ppm)
  const ticks = [];
  for (let t = min; t <= max + 0.1; t += 20) {
    ticks.push(Number(t.toFixed(0)));
  }

  return `
    <style>
      .cya-analysis-container {
        margin-bottom: 48px;
      }
      .cya-analysis-heading {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 32px;
        color: #6a1b9a;
        letter-spacing: 0.5px;
      }
      .cya-scale-bar {
        position: relative;
        height: 32px;
        background: #f3e5f5; /* light purple for out-of-range */
        border-radius: 8px;
        margin: 40px 0 16px 0;
        box-shadow: 0 1px 2px #0001;
        overflow: visible;
      }
      .cya-range.acceptable {
        position: absolute;
        top: 0; left: ${acceptableStart}%;
        width: ${acceptableWidth}%;
        height: 100%;
        background: #6a1b9a; /* dark purple */
        opacity: 0.85;
        z-index: 1;
        border-radius: 8px;
      }
      .cya-marker {
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
      .cya-marker-label {
        font-size: 0.7em;
        color: #fff;
        background: #6a1b9a;
        padding: 1px 8px;
        border-radius: 4px;
        margin-bottom: 4px;
        white-space: nowrap;
        font-weight: bold;
        border: 1px solid #6a1b9a;
        box-shadow: 0 1px 2px #0002;
      }
      .cya-arrow {
        font-size: 1.8em
        color: #111;
        line-height: 2;
        margin-bottom: 0;
      }
      .cya-ticks {
        position: relative;
        height: 24px;
        margin-top: 6px;
        width: 100%;
      }
      .cya-tick {
        position: absolute;
        top: 0;
        width: 2px;
        height: 10px;
        background: #6a1b9a;
        z-index: 10;
      }
      .cya-tick-label {
        position: absolute;
        top: 12px;
        font-size: 0.95em;
        color: #6a1b9a;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 10;
      }
      .cya-annotation-row {
        position: relative;
        width: 100%;
        height: 24px;
        margin-top: 2px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        pointer-events: none;
      }
      .cya-annotation.acceptable {
        position: absolute;
        display: flex;
        align-items: center;
        font-size: 0.7125em;
        font-weight: bold;
        background: transparent;
        color: #6a1b9a;
        gap: 4px;
        pointer-events: none;
        height: 24px;
        line-height: 1;
        left: ${acceptableStart}%;
        width: ${acceptableWidth}%;
        justify-content: center;
      }
      .cya-results-row {
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
        .cya-results-row {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }
        .cya-analysis-container {
          margin-bottom: 32px;
        }
      }
    </style>
    <div class="cya-analysis-container">
      <div class="cya-analysis-heading">Cyanuric Acid (CYA) Analysis</div>
      <div class="cya-scale-bar">
        <div class="cya-range acceptable"></div>
        <div class="cya-marker">
          <div class="cya-marker-label">${currentCya} ppm</div>
          <span class="cya-arrow">&#8595;</span>
        </div>
      </div>
      <div class="cya-ticks">
        ${ticks.map(tick => `
          <div class="cya-tick" style="left:${percent(tick)}%;"></div>
          <div class="cya-tick-label" style="left:${percent(tick)}%;">${tick}</div>
        `).join('')}
      </div>
      <div class="cya-annotation-row" style="margin-top: 8px;">
        <div class="cya-annotation acceptable"
          style="left:${acceptableStart}%;width:${acceptableWidth}%;">
          Acceptable Range
        </div>
      </div>
      <div class="cya-results-row">
        <div class="current-value">Current CYA: <strong>${currentCya} ppm</strong></div>
      </div>
    </div>
  `;
}