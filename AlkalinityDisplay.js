import { poolStandards } from '../config.js';

// Helper to calculate sodium bicarbonate dose (to raise alkalinity)
function calculateBicarbDose(current, target, poolVolume) {
  if (target <= current) return 0;
  const ppmIncrease = target - current;
  // Dose in lbs = (ppmIncrease / 10) * 1.4 * (poolVolume / 10000)
  return ((ppmIncrease / 10) * 1.4 * (poolVolume / 10000));
}

export function renderAlkalinityDisplay({
  state,
  poolType,
  currentAlk,
  poolVolume
}) {
  // Get standards for this state/poolType
  const standards = poolStandards[state][poolType];
  const min = 0;
  const max = 200;

  // Define ranges for display
  const acceptableRange = { min: 60, max: 140 };
  const idealRange = { min: 80, max: 120 };

  // For dose recommendations, use 80 and 120 ppm as targets
  const dose80 = calculateBicarbDose(currentAlk, 80, poolVolume);
  const dose100 = calculateBicarbDose(currentAlk, 100, poolVolume);
  const dose120 = calculateBicarbDose(currentAlk, 120, poolVolume);

  // Defensive: ensure number
  currentAlk = typeof currentAlk === 'number' && !isNaN(currentAlk) ? currentAlk : 0;

  // Calculate positions as percent of the scale
  const percent = v => ((v - min) / (max - min)) * 100;
  const markerPercent = Math.min(100, Math.max(0, percent(currentAlk)));
  const acceptableStart = percent(acceptableRange.min);
  const acceptableWidth = percent(acceptableRange.max) - acceptableStart;
  const idealStart = percent(idealRange.min);
  const idealWidth = percent(idealRange.max) - idealStart;

  // Tick marks: every 20 ppm from 0 to 200
  const ticks = [];
  for (let t = 0; t <= 200; t += 20) {
    ticks.push(t);
  }

  // Bar heights
  const barHeight = 16; // px, half of the scale bar height (32px)
  const barGap = 4;     // px, vertical gap between bars

  return `
    <style>
      .alkalinity-analysis-container {
        margin-bottom: 48px;
      }
      .alkalinity-analysis-heading {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 32px;
        color: #228B22;
        letter-spacing: 0.5px;
      }
      .alkalinity-scale-bar {
        position: relative;
        height: 32px;
        background: #eee;
        border-radius: 8px;
        margin: 40px 0 16px 0;
        box-shadow: 0 1px 2px #0001;
        overflow: visible;
      }
      .alkalinity-range.acceptable {
        position: absolute;
        top: ${16 + barGap}px;
        left: ${acceptableStart}%;
        width: ${acceptableWidth}%;
        height: ${barHeight}px;
        background: #90EE90;
        z-index: 2;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .alkalinity-range.ideal {
        position: absolute;
        top: 0;
        left: ${idealStart}%;
        width: ${idealWidth}%;
        height: ${barHeight}px;
        background: #228B22;
        opacity: 0.7;
        z-index: 3;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .alkalinity-marker {
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
      .alkalinity-marker-label {
        font-size: 0.7em;
        color: #fff;
        background: #228B22;
        padding: 1px 8px;
        border-radius: 4px;
        margin-bottom: 4px;
        white-space: nowrap;
        font-weight: bold;
        border: 1px solid #228B22;
        box-shadow: 0 1px 2px #0002;
      }
      .alkalinity-arrow {
        font-size: 1.8em;
        color: #111;
        line-height: 2;
        margin-bottom: 0;
      }
      .alkalinity-ticks {
        position: relative;
        height: 24px;
        margin-top: 6px;
        width: 100%;
      }
      .alkalinity-tick {
        position: absolute;
        top: 0;
        width: 2px;
        height: 10px;
        background: #228B22;
        z-index: 10;
      }
      .alkalinity-tick-label {
        position: absolute;
        top: 12px;
        font-size: 0.95em;
        color: #228B22;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 10;
      }
      .alkalinity-annotation-row {
        position: relative;
        width: 100%;
        height: 2px;
        margin-top: 2px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        pointer-events: none;
      }
      .alkalinity-annotation {
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
      .alkalinity-annotation.ideal {
        color: #fff;
        background: #228B22;
        left: ${idealStart}%;
        width: ${idealWidth}%;
        border-radius: 4px;
        justify-content: center;
        padding: 2px 8px;
        top: 0;
        z-index: 4;
      }
      .alkalinity-annotation.acceptable {
        color: #333;
        background: #90EE90;
        left: ${acceptableStart}%;
        width: ${acceptableWidth}%;
        border-radius: 4px;
        justify-content: center;
        padding: 2px 8px;
        top: ${barHeight + barGap}px;
        z-index: 4;
      }
      .alkalinity-results-row {
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
        .alkalinity-results-row {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }
        .alkalinity-analysis-container {
          margin-bottom: 32px;
        }
      }
    </style>
    <div class="alkalinity-analysis-container">
      <div class="alkalinity-analysis-heading">Alkalinity Analysis</div>
      <div class="alkalinity-scale-bar">
        <div class="alkalinity-range ideal"></div>
        <div class="alkalinity-range acceptable"></div>
        <div class="alkalinity-marker">
          <div class="alkalinity-marker-label">${currentAlk} ppm</div>
          <span class="alkalinity-arrow">&#8595;</span>
        </div>
      </div>
      <div class="alkalinity-ticks">
        ${ticks.map(tick => `
          <div class="alkalinity-tick" style="left:${percent(tick)}%;"></div>
          <div class="alkalinity-tick-label" style="left:${percent(tick)}%;">${tick}</div>
        `).join('')}
      </div>
      <div class="alkalinity-annotation-row" style="margin-top: 8px;">
        <div class="alkalinity-annotation ideal"
          style="left:${idealStart}%;width:${idealWidth}%;top:0;">
          Ideal Range
        </div>
      </div>
      <div class="alkalinity-annotation-row" style="margin-top: ${barHeight + barGap + 8}px;">
        <div class="alkalinity-annotation acceptable"
          style="left:${acceptableStart}%;width:${acceptableWidth}%;top:0;">
          Acceptable Range
        </div>
      </div>
      <div class="alkalinity-results-row">
        <div class="current-value">Current Alkalinity: <strong>${currentAlk} ppm</strong></div>
        <div class="dose-recommendations">
          <div>To reach <strong>80 ppm</strong>: <span class="dose">${dose80 > 0 ? dose80.toFixed(2) + ' lbs sodium bicarbonate' : 'No dose needed'}</span></div>
          <div>To reach <strong>100 ppm</strong>: <span class="dose">${dose100 > 0 ? dose100.toFixed(2) + ' lbs sodium bicarbonate' : 'No dose needed'}</span></div>
          <div>To reach <strong>120 ppm</strong>: <span class="dose">${dose120 > 0 ? dose120.toFixed(2) + ' lbs sodium bicarbonate' : 'No dose needed'}</span></div>
        </div>
      </div>
    </div>
  `;
}

