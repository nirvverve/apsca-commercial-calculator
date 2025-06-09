/**
 * Calculate the salt dose needed to reach a target salt level.
 * @param {number} currentSalt - Current salt level (ppm)
 * @param {number} targetSalt - Target salt level (ppm)
 * @param {number} poolVolume - Pool volume (gallons)
 * @returns {object} { lbs, bags, display }
 */
export function getSaltDose({ currentSalt, targetSalt, poolVolume }) {
    if (
      typeof currentSalt !== 'number' ||
      typeof targetSalt !== 'number' ||
      typeof poolVolume !== 'number' ||
      isNaN(currentSalt) ||
      isNaN(targetSalt) ||
      isNaN(poolVolume) ||
      poolVolume <= 0
    ) {
      return { lbs: 0, bags: 0, display: 'Invalid input' };
    }
  
    const ppmNeeded = Math.max(targetSalt - currentSalt, 0);
    // 9 lbs per 10,000 gal raises salt by 100 ppm
    const lbs = (ppmNeeded / 100) * 9 * (poolVolume / 10000);
    const bags = Math.ceil(lbs / 40);
  
    let display = '';
    if (lbs > 0) {
      display = `${Math.round(lbs)} lbs salt (${bags} × 40lb bag${bags === 1 ? '' : 's'})`;
    } else {
      display = 'No salt addition needed';
    }
  
    return { lbs, bags, display };
  }