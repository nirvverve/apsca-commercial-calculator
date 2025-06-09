// Configuration object for commercial pool chemical standards by state and pool type

const poolStandards = {
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
    },
    Massachusetts: {
      pool: {
        freeChlorine: { min: 1.0, max: 3.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      },
      spa: { 
        freeChlorine: { min: 2.0, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      }
    },
    Connecticut: {
      pool: {
        freeChlorine: { min: 0.8, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      },
      spa: {
        freeChlorine: { min: 0.8, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
        }
    },
   NewYork: {
      pool: {
        freeChlorine: { min: 0.6, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.0, max: 8.2 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 0 },
        calcium: { min: 150, max: 1000 }
      },
      spa: { 
        freeChlorine: { min: 2.0, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 0 },
        calcium: { min: 150, max: 1000 }
      }
    },

    NewJersey: {
      pool: {
        freeChlorine: { min: 0.6, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.0, max: 8.2 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
      },
      spa: { 
        freeChlorine: { min: 1.5, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 60, max: 180 },
        cya: { min: 0, max: 0 },
        calcium: { min: 150, max: 1000 }
      }
    }, 

    NewYorkCity: {
      pool: {
        freeChlorine: { min: 0.6, max: 5.0, cyaRatio: 0.00 },
        pH: { min: 7.0, max: 7.8 },
        alkalinity: { min: 80, max: 120 },
        cya: { min: 0, max: 0 },
        calcium: { min: 200, max: 400 }
        },
        spa: {
        freeChlorine: { min: 0.6, max: 5.0, cyaRatio: 0.00 },
        pH: { min: 7.0, max: 7.8 },
        alkalinity: { min: 80, max: 120 },
        cya: { min: 0, max: 0 },
        calcium: { min: 200, max: 400 }
      }
    },

    Pennsylvania: {
      pool: {
        freeChlorine: { min: 0.4, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.6 },
        alkalinity: { min: 80, max: 120 },
        cya: { min: 0, max: 100 },
        calcium: { min: 200, max: 400 }
        },
      spa: {
        freeChlorine: { min: 1.0, max: 5.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.6 },
        alkalinity: { min: 80, max: 120 },
        cya: { min: 0, max: 0 },
        calcium: { min: 200, max: 400 }
        }
    },
    Maryland: {
      pool: {
        freeChlorine: { min: 1.5, max: 10.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 120 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 400 }
        },
      spa: {
        freeChlorine: { min: 4.0, max: 10.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 120 },
        cya: { min: 0, max: 0 },
        calcium: { min: 150, max: 400 }
        }
    },
    Virginia: {
      pool: {
        freeChlorine: { min: 1.0, max: 3.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 120 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
        },
      spa: {
        freeChlorine: { min: 3.0, max: 9.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 160 },
        cya: { min: 0, max: 0 },
        calcium: { min: 200, max: 800 }
        }
    },
    Tennessee: {
      pool: {
        freeChlorine: { min: 0.5, max: 3.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.6 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
        },
      spa: {
        freeChlorine: { min: 1.0, max: 3.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.6 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 0 },
        calcium: { min: 200, max: 800 }
        }
    },
    Georgia:{
      pool: {
        freeChlorine: { min: 2.0, max: 10.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 90 },
        calcium: { min: 150, max: 1000 }
        },
      spa: {
        freeChlorine: { min: 2.0, max: 10.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 90 },
        calcium: { min: 200, max: 800 }
        }
    },
    NorthCarolina:{
      pool: {
        freeChlorine: { min: 1.0, max: 10.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
        },
      spa: {
        freeChlorine: { min: 2.0, max: 10.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 200, max: 800 }
        }
    },
    SouthCarolina:{
      pool: {
        freeChlorine: { min: 1.0, max: 8.0, cyaRatio: 0.05 },
        pH: { min: 7.0, max: 7.8 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 1000 }
        },
      spa: {
        freeChlorine: { min: 2.0, max: 8.0, cyaRatio: 0.05 },
        pH: { min: 7.2, max: 7.8 },
        alkalinity: { min: 80, max: 180 },
        cya: { min: 0, max: 100 },
        calcium: { min: 150, max: 800 }
        }
    },
    }
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
    cya: 30,
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