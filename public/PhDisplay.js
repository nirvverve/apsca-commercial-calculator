import { poolStandards } from '../config.js';

// Helper to calculate acid dose (to lower pH)
function acidDoseFlOzGallons(currentPh, targetPh, poolGallons, alkalinity) {
  if (currentPh <= targetPh) return null;
  const poolFactor = 76 * (poolGallons / 10000);
  const alkFactor = alkalinity / 100;
  const acidFlOz = (currentPh - targetPh) * poolFactor * alkFactor;
  if (acidFlOz <= 0) return null;
  if (acidFlOz < 128) {
    return `${acidFlOz.toFixed(1)} fl oz muriatic acid (31.45%)`;
  } else {
    return `${(acidFlOz / 128).toFixed(2)} gal (${acidFlOz.toFixed(1)} fl oz) muriatic acid (31.45%)`;
  }
}

// Helper to calculate soda ash dose (to raise pH)
function sodaAshDoseOz(currentPh, targetPh, poolGallons, alkalinity) {
  if (currentPh >= targetPh) return null;
  const diff = targetPh - currentPh;
  if (diff <= 0) return null;
  const ounces = (diff / 0.2) * 6 * (poolGallons / 10000);
  if (ounces <= 0) return null;
  if (ounces > 16) {
    return `${(ounces / 16).toFixed(2)} lbs (${ounces.toFixed(1)} oz) soda ash`;
  } else {
    return `${ounces.toFixed(1)} oz soda ash`;
  }
}

export function renderPhDisplay({
  state,
  poolType,
  currentPh,
  poolVolume,
  alkalinity
}) {
  const standards = poolStandards[state]?.[poolType];
  if (!standards || !standards.pH || typeof standards.pH.min !== 'number' || typeof standards.pH.max !== 'number') {
    return `<div class="ph-analysis-container"><div class="ph-analysis-heading">pH Analysis</div>
    <div style="color:red;">pH standards not defined for this state/pool type.</div></div>`;
  }
  const min = 6.4;
  const max = 8.4;

  // Use state-specific acceptable range
  const acceptableRange = {
    min: standards.pH.min,
    max: standards.pH.max
  };

  // Defensive: ensure number
  currentPh = typeof currentPh === 'number' && !isNaN(currentPh) ? currentPh : 0;

  // Calculate positions as percent of the scale
  const percent = v => ((v - min) / (max - min)) * 100;
  const markerPercent = Math.min(100, Math.max(0, percent(currentPh)));
  const acceptableStart = percent(acceptableRange.min);
  const acceptableWidth = percent(acceptableRange.max) - acceptableStart;

  // Tick marks (every 0.2)
  const ticks = [];
  for (let t = min; t <= max + 0.001; t += 0.2) {
    ticks.push(Number(t.toFixed(2)));
  }

  // Acid dose targets (to lower pH)
  const acidTargets = [7.8, 7.6, 7.4, 7.2].filter(t => currentPh > t);
  // Soda ash dose targets (to raise pH)
  const sodaAshTargets = [7.2, 7.4, 7.6, 7.8].filter(t => currentPh < t);

  return `
    <style>
    .ph-analysis-container {
      margin-bottom: 48px;
    }
    .ph-analysis-heading {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 32px;
      color: #b71c1c;
      letter-spacing: 0.5px;
    }
    .ph-scale-bar {
      position: relative;
      height: 32px;
      background: #fce4ec; /* light pink for out-of-range */
      border-radius: 8px;
      margin: 40px 0 16px 0;
      box-shadow: 0 1px 2px #0001;
      overflow: visible;
    }
    .ph-range.acceptable {
      position: absolute;
      top: 0; left: ${acceptableStart}%;
      width: ${acceptableWidth}%;
      height: 100%;
      background: #b71c1c; /* dark red */
      opacity: 0.85;
      z-index: 1;
      border-radius: 8px;
    }
    .ph-marker {
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
    .ph-marker-label {
      font-size: 0.7em;
      color: #fff;
      background: #b71c1c;
      padding: 1px 8px;
      border-radius: 4px;
      margin-bottom: 4px;
      white-space: nowrap;
      font-weight: bold;
      border: 1px solid #b71c1c;
      box-shadow: 0 1px 2px #0002;
    }
    .ph-arrow {
      font-size: 1.8em;
      color: #111;
      line-height: 2;
      margin-bottom: 0;
    }
    .ph-ticks {
      position: relative;
      height: 24px;
      margin-top: 6px;
      width: 100%;
    }
    .ph-tick {
      position: absolute;
      top: 0;
      width: 2px;
      height: 10px;
      background: #b71c1c;
      z-index: 10;
    }
    .ph-tick-label {
      position: absolute;
      top: 12px;
      font-size: 0.95em;
      color: #b71c1c;
      transform: translateX(-50%);
      white-space: nowrap;
      z-index: 10;
    }
    .ph-annotation-row {
      position: relative;
      width: 100%;
      height: 24px;
      margin-top: 2px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      pointer-events: none;
    }
    .ph-annotation.acceptable {
      position: absolute;
      display: flex;
      align-items: center;
      font-size: 0.7125em;
      font-weight: bold;
      background: transparent;
      color: #b71c1c;
      gap: 4px;
      pointer-events: none;
      height: 24px;
      line-height: 1;
      left: ${acceptableStart}%;
      width: ${acceptableWidth}%;
      justify-content: center;
    }
    .ph-results-row {
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
    .dose-list {
      margin: 0;
      padding-left: 1.2em
      line height: 1.2;
    }
    .dose-list li {
      margin-bottom: 2px;
      line-height: 1.2;
    }
    @media (max-width: 600px) {
      .ph-results-row {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
      }
      .ph-analysis-container {
        margin-bottom: 32px;
      }
    }
    </style>
    <div class="ph-analysis-container">
      <div class="ph-analysis-heading">pH Analysis</div>
      <div class="ph-scale-bar">
        <div class="ph-range acceptable"></div>
        <div class="ph-marker" style="left:${markerPercent}%; top:-38px;">
          <div class="ph-marker-label">${currentPh}</div>
          <span class="ph-arrow">&#8595;</span>
        </div>
      </div>
      <div class="ph-ticks">
        ${ticks.map(tick => `
          <div class="ph-tick" style="left:${percent(tick)}%;"></div>
          <div class="ph-tick-label" style="left:${percent(tick)}%;">${tick}</div>
        `).join('')}
      </div>
      <div class="ph-annotation-row" style="margin-top: 8px;">
        <div class="ph-annotation acceptable"
          style="left:${acceptableStart}%;width:${acceptableWidth}%;">
          Acceptable Range
        </div>
      </div>
      <div class="ph-results-row">
        <div class="current-value">Current pH: <strong>${currentPh}</strong></div>
        <div class="dose-recommendations">
          <div><strong>To lower pH:</strong>
            <ul class="dose-list">
              ${acidTargets.length === 0 ? '<li>No acid dose needed</li>' :
                acidTargets.map(target => {
                  const dose = acidDoseFlOzGallons(currentPh, target, poolVolume, alkalinity);
                  return `<li>to <strong>${target}</strong>: <span class="dose">${dose ? dose : 'No dose needed'}</span></li>`;
                }).join('')}
            </ul>
          </div>
          <div><strong>To raise pH:</strong>
            <ul class="dose-list">
              ${sodaAshTargets.length === 0 ? '<li>No soda ash dose needed</li>' :
                sodaAshTargets.map(target => {
                  const dose = sodaAshDoseOz(currentPh, target, poolVolume, alkalinity);
                  return `<li>to <strong>${target}</strong>: <span class="dose">${dose ? dose : 'No dose needed'}</span></li>`;
                }).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}