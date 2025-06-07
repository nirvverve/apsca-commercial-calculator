// Utility for rounding to nearest 1/16 (for gallons or pounds)
function roundToNearestSixteenth(value) {
    return Math.round(value * 16) / 16;
  }
  
  // Utility to express a decimal as a mixed fraction string (e.g., 0.125 -> "1/8")
  function toMixedFraction(value, unit, fractionDenominator = 4) {
    const rounded = Math.round(value * fractionDenominator) / fractionDenominator;
    const whole = Math.floor(rounded);
    const frac = rounded - whole;
    let fracStr = '';
    if (fractionDenominator === 16) {
      const sixteenths = [
        [0.0625, '1/16'], [0.125, '1/8'], [0.1875, '3/16'], [0.25, '1/4'],
        [0.3125, '5/16'], [0.375, '3/8'], [0.4375, '7/16'], [0.5, '1/2'],
        [0.5625, '9/16'], [0.625, '5/8'], [0.6875, '11/16'], [0.75, '3/4'],
        [0.8125, '13/16'], [0.875, '7/8'], [0.9375, '15/16']
      ];
      for (const [val, str] of sixteenths) {
        if (Math.abs(frac - val) < 0.01) { fracStr = str; break; }
      }
    } else {
      if (Math.abs(frac - 0.25) < 0.01) fracStr = '1/4';
      else if (Math.abs(frac - 0.5) < 0.01) fracStr = '1/2';
      else if (Math.abs(frac - 0.75) < 0.01) fracStr = '3/4';
    }
    if (whole > 0 && fracStr) return `${whole} ${fracStr} ${unit}`;
    if (whole > 0) return `${whole} ${unit}`;
    if (fracStr) return `${fracStr} ${unit}`;
    return `0 ${unit}`;
  }
  
  // Utility to convert pounds to ounces (for spa display and for <1 lb cal-hypo)
  function lbsToLbsOz(lbs) {
    const totalOz = lbs * 16;
    const wholeLbs = Math.floor(totalOz / 16);
    const oz = totalOz % 16;
    let result = '';
    if (wholeLbs > 0) result += `${wholeLbs} lb${wholeLbs > 1 ? 's' : ''}`;
    if (oz > 0) result += (result ? ' ' : '') + `${oz} oz`;
    if (!result) result = '0 oz';
    return result;
  }
  
  // Utility to convert pounds of liquid chlorine (12.5%) to gallons and fluid ounces
  // 1 gallon of 12.5% liquid chlorine weighs about 10 lbs
  function lbsToGallons(lbs) {
    return lbs / 10;
  }
  function lbsToFluidOunces(lbs) {
    return (lbs / 10) * 128;
  }
  
  // Main formatting function for chlorine dose
  export function formatChlorineDose({
    lbs,
    poolType, // 'pool' or 'spa'
    chlorineType // 'liquid' or 'cal-hypo'
  }) {
    if (chlorineType === 'liquid') {
      if (poolType === 'pool') {
        const gallons = lbsToGallons(lbs);
        if (gallons < 1 && gallons > 0) {
          // Show as approx fraction of a gallon and exact fl oz
          const fraction = toMixedFraction(gallons, 'gallon', 16);
          const flOz = lbsToFluidOunces(lbs);
          return `Dose approximately ${fraction} (exact is ${flOz.toFixed(0)} fl. oz)`;
        } else {
          // 1 gallon or more: show as mixed fraction only
          return `Dose ${toMixedFraction(gallons, 'gallon' + (gallons !== 1 ? 's' : ''), 16)}`;
        }
      } else {
        // Spa: convert lbs to fluid ounces, round to 1 decimal
        const flOz = lbsToFluidOunces(lbs);
        return `Dose ${flOz.toFixed(1)} fl oz`;
      }
    } else if (chlorineType === 'cal-hypo') {
      if (poolType === 'pool') {
        if (lbs < 1 && lbs > 0) {
          // Show as approx fraction of a pound and exact oz
          const fraction = toMixedFraction(lbs, 'lb', 16);
          const oz = lbs * 16;
          return `Dose approximately ${fraction} (exact is ${oz.toFixed(0)} oz)`;
        } else {
          // 1 lb or more: show as mixed fraction only
          return `Dose ${toMixedFraction(lbs, 'lb' + (lbs !== 1 ? 's' : ''), 16)}`;
        }
      } else {
        // Spa: show lbs and ounces
        return `Dose ${lbsToLbsOz(lbs)}`;
      }
    } else {
      // Fallback: just show lbs
      return `Dose ${lbs.toFixed(2)} lbs`;
    }
  }