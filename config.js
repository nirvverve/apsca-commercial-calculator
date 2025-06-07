// Configuration object for commercial pool chemical standards by state and pool type

const poolStandards = {
    Arizona: {
      pool: {
        freeChlorine: { min: 1.0, max: 5.0, cyaRatio: 0.05 }, // FC must be at least 5% of CYA
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 }, // No minimum, max 100
        calcium: { min: 150, max: 1000 } // No standard
      },
      spa: {
        freeChlorine: { min: 3.0, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      }
    },
    Florida: {
      pool: {
        freeChlorine: { min: 1.0, max: 10.0, cyaRatio: 0.05 },
        pH: { min: 7.0, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      },
      spa: {
        freeChlorine: { min: 2.0, max: 5.0, cyaRation: 0.05 },
        pH: { min: 7.0, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 40 }, // Max 40 for spas
        calcium: { min: 150, max: 1000 }
      }
    },
    Texas: {
      pool: {
        freeChlorine: { min: 1.0, max: 6.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      },
      spa: {
        freeChlorine: { min: 1.0, max: 6.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      }
    }
  };
  
  // Supported chlorine types and their concentrations
  const chlorineTypes = [
    { id: "liquid", name: "Liquid Chlorine (10%)", concentration: 0.10 },
    { id: "liquid", name: "Liquid Chlorine (12.5%)", concentration: 0.125 },
    { id: "cal-hypo", name: "Calcium Hypochlorite (68%)", concentration: 0.68 },
    { id: "cal-hypo", name: "Calcium Hypochlorite (73%)", concentration: 0.73 }
  ];
  
  export { poolStandards, chlorineTypes };
export const goldenNumbers = {
  pool: {
    cya: 50,
    alkalinity: 100,
    calcium: 300,
    ph: 7.6
  },
  spa: {
    cya: 0,
    alkalinity: 80,
    calcium: 300,
    ph: 7.5
  }
};