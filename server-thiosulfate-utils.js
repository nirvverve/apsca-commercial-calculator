/**
 * Calculates the amount of sodium thiosulfate needed to reduce Free Chlorine.
 * @param {number} currentFC - Current Free Chlorine in ppm.
 * @param {number} targetFC - Target Free Chlorine in ppm.
 * @param {number} poolVolume - Pool volume in gallons.
 * @returns {number} - Ounces of sodium thiosulfate needed.
 */
function calculateThioDoseOunces(currentFC, targetFC, poolVolume) {
    // Standard formula: 1.3 oz of sodium thiosulfate (pentahydrate)
    // removes 1 ppm of chlorine from 10,000 gallons of water.
    const ppmToRemove = currentFC - targetFC;
    if (ppmToRemove <= 0 || poolVolume <= 0) {
        return 0;
    }
    return ppmToRemove * (poolVolume / 10000) * 1.3;
}

/**
 * Formats ounces into a string like "X.XX oz (Y lb Z.ZZ oz)".
 * @param {number} oz - Ounces to format.
 * @returns {string} - Formatted string.
 */
function formatOuncesDisplay(oz) {
    if (oz < 0.01) return "0 oz"; // Handle very small amounts
    const lbs = Math.floor(oz / 16);
    const remOz = oz % 16;
    if (lbs > 0) {
        return `${oz.toFixed(2)} oz (${lbs} lb${lbs > 1 ? 's' : ''} ${remOz.toFixed(2)} oz)`;
    } else {
        return `${oz.toFixed(2)} oz`;
    }
}

/**
 * Generates the data for the thiosulfate dose table.
 * @param {number} currentFC - Current Free Chlorine in ppm.
 * @param {number} poolVolume - Pool volume in gallons.
 * @returns {Array<Object>} - Array of objects { targetFCDisplay: string, doseDisplay: string }.
 */
function getThiosulfateDoseTableData(currentFC, poolVolume) {
    const tableRows = [];
    const steps = [];

    // Define target FC points for the table
    // 5 ppm steps from current down to a bit above 10
    for (let fc = Math.floor(currentFC / 5) * 5; fc > 10; fc -= 5) {
        if (fc < currentFC) steps.push(fc);
    }
    // 1.0 ppm steps from 10 down to 0
    for (let fc = 10; fc >= 0; fc -= 1.0) {
        if (fc < currentFC) steps.push(fc);
        if (fc === 0) break; // Ensure 0 is included if applicable
    }
    // Remove duplicates and sort descending if necessary (though loop structure should handle order)
    const uniqueSteps = [...new Set(steps)].sort((a, b) => b - a);


    uniqueSteps.forEach(targetFC => {
        const doseOz = calculateThioDoseOunces(currentFC, targetFC, poolVolume);
        if (doseOz > 0) { // Only add row if a dose is needed
            tableRows.push({
                targetFCDisplay: targetFC.toFixed(1),
                doseDisplay: formatOuncesDisplay(doseOz)
            });
        }
    });
     // Ensure a row for 0 ppm target if currentFC > 0
    if (currentFC > 0 && !uniqueSteps.includes(0)) {
        const doseForZeroFCOz = calculateThioDoseOunces(currentFC, 0, poolVolume);
        if (doseForZeroFCOz > 0) {
             // Check if 0 ppm target is already effectively covered by a very close target
            const lastTarget = tableRows.length > 0 ? parseFloat(tableRows[tableRows.length - 1].targetFCDisplay) : Infinity;
            if (lastTarget !== 0) {
                tableRows.push({
                    targetFCDisplay: "0.0",
                    doseDisplay: formatOuncesDisplay(doseForZeroFCOz)
                });
            }
        }
    }


    return tableRows;
}

module.exports = {
    getThiosulfateDoseTableData
};