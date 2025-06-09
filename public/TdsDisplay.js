export function renderTdsDisplay({
  currentTds
}) {
  // Define the TDS scale range (commonly 0–5000 ppm for pools)
  const min = 0;
  const max = 8000;

  // Defensive: ensure number
  currentTds = typeof currentTds === 'number' && !isNaN(currentTds) ? currentTds : 0;

  // Calculate position as percent of the scale
  const percent = v => ((v - min) / (max - min)) * 100;
  const arrowPercent = Math.min(100, Math.max(0, percent(currentTds)));

  // Tick marks (every 1000 ppm)
  const ticks = [];
  for (let t = min; t <= max + 1; t += 1000) {
    ticks.push(Number(t));
  }

  return `
    <style>
      .tds-analysis-container {
        margin-bottom: 48px;
      }
      .tds-analysis-heading {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 32px;
        color: #757575;
        letter-spacing: 0.5px;
      }
      .tds-scale-bar {
        position: relative;
        height: 32px;
        background: #e0e0e0;
        border-radius: 8px;
        margin: 40px 0 16px 0;
        box-shadow: 0 1px 2px #0001;
        overflow: visible;
      }
      .tds-bar {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        background: #757575;
        opacity: 0.7;
        z-index: 1;
        border-radius: 8px;
      }
      .tds-marker {
        position: absolute;
        left: ${arrowPercent}%;
        top: -38px;
        width: 0;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
      }
      .tds-marker-label {
        font-size: 0.7em;
        color: #fff;
        background: #757575;
        padding: 1px 8px;
        border-radius: 4px;
        margin-bottom: 4px;
        white-space: nowrap;
        font-weight: bold;
        border: 1px solid #757575;
        box-shadow: 0 1px 2px #0002;
      }
      .tds-arrow {
        font-size: 1.8em;
        color: #111;
        line-height: 2;
        margin-bottom: 0;
      }
      .tds-ticks {
        position: relative;
        height: 24px;
        margin-top: 6px;
        width: 100%;
      }
      .tds-tick {
        position: absolute;
        top: 0;
        width: 2px;
        height: 10px;
        background: #757575;
        z-index: 10;
      }
      .tds-tick-label {
        position: absolute;
        top: 12px;
        font-size: 0.95em;
        color: #757575;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 10;
      }
      .tds-results-row {
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
        .tds-results-row {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }
        .tds-analysis-container {
          margin-bottom: 32px;
        }
      }
    </style>
    <div class="tds-analysis-container">
      <div class="tds-analysis-heading">Total Dissolved Solids (TDS)</div>
      <div class="tds-scale-bar">
        <div class="tds-bar"></div>
        <div class="tds-marker">
          <div class="tds-marker-label">${currentTds} ppm</div>
          <span class="tds-arrow">&#8595;</span>
        </div>
      </div>
      <div class="tds-ticks">
        ${ticks.map(tick => `
          <div class="tds-tick" style="left:${percent(tick)}%;"></div>
          <div class="tds-tick-label" style="left:${percent(tick)}%;">${tick}</div>
        `).join('')}
      </div>
      <div class="tds-results-row">
        <div class="current-value">Current TDS: <strong>${currentTds} ppm</strong></div>
      </div>
    </div>
  `;
}