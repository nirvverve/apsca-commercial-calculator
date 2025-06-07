import { formatChlorineDose } from './ChlorineDoseUtils.js';

/**
 * Calculate breakpoint chlorination recommendation and dose.
 * @param {number} freeChlorine - current free chlorine (ppm)
 * @param {number} totalChlorine - current total chlorine (ppm)
 * @param {number} poolVolume - gallons
 * @param {object} chlorineType - { id, name, concentration }
 * @returns {object} { combinedChlorine, ppmNeeded, doseLbs, doseText, recommendation }
 */
export function getBreakpointChlorination({
  freeChlorine,
  totalChlorine,
  poolVolume,
  chlorineType
}) {
  const combinedChlorine = Math.max(totalChlorine - freeChlorine, 0);
  const breakpointTarget = combinedChlorine * 10;
  const ppmNeeded = Math.max(breakpointTarget - freeChlorine, 0);

  let recommendation = '';
  if (combinedChlorine >= 1.6) {
    recommendation = 'YES - Immediate breakpoint chlorination (shocking) is recommended because combined chlorine exceeds 1.6 ppm.  Dosing at night after the pool closes for the day will be the most effective.  Be sure to backwash right before shocking the pool and again before reopening.  Free chlorine level must be below the state maximum before reopening to swimmers.';
  } else if (combinedChlorine >= 0.6) {
    recommendation = 'YES - Breakpoint chlorination (shock) should be performed within 72 hours right after pool closes for the day, as combined chlorine exceeds 0.6 ppm. Be sure to backwash right before shocking the pool and again before reopening.  Free chlorine level must be below the state maximum before reopening to swimmers.';
  } else {
    recommendation = 'NO - The pool does not need to be brought to breakpoint (aka shocked) this week.';
  }

  let doseLbs = 0, doseText = '';
  if (ppmNeeded > 0) {
    // Corrected formula: 0.0834 lbs per 10,000 gal per 1 ppm of 100% chlorine
    // For other concentrations: divide by concentration
    // For poolVolume in gallons:
    // doseLbs = (ppmNeeded * poolVolume / 10000) * (0.0834 / concentration)
    doseLbs = (ppmNeeded * poolVolume * 0.0834) / (10000 * chlorineType.concentration);
    doseText = formatChlorineDose({
      lbs: doseLbs,
      poolType: 'pool', // or 'spa' if needed
      chlorineType: chlorineType.id
    });
  }

  return {
    combinedChlorine: combinedChlorine.toFixed(2),
    ppmNeeded: ppmNeeded.toFixed(2),
    doseLbs,
    doseText,
    recommendation
  };
}