function getSaltDose({ currentSalt, targetSalt, poolVolume }) {
    const saltDeficit = targetSalt - currentSalt;
    if (saltDeficit <= 0) {
      return { lbsNeeded: 0, display: "Salt level is at or above target. No salt needed." };
    }
    const lbsNeeded = saltDeficit * poolVolume * 0.00000834;
  
    return {
      lbsNeeded: parseFloat(lbsNeeded.toFixed(1)), // Ensure lbsNeeded is a number
      display: `Add ${lbsNeeded.toFixed(1)} lbs of salt to reach ${targetSalt} ppm.`
    };
  }
  
  module.exports = {
    getSaltDose
  };