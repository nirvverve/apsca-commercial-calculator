const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // You'll use this later for API requests
const { getBreakpointChlorination } = require('./server-breakpoint-utils.js');
const { getWaterBalanceSteps } = require('./server-water-balance-utils.js')
const { advancedLSI, getLSIFactors } = require('./server-lsiutils.js')
const { getSaltDose } = require('./server-salt-dose-utils.js');
const { formatChlorineDose } = require('./server-chlorine-dose-utils');
const { getThiosulfateDoseTableData } = require('./server-thiosulfate-utils.js')

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 for now

// This tells Express to look in the 'public' folder for files requested by the browser
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies (for when your client sends data to the server API)
app.use(bodyParser.json());

// A simple check to see if the server is running
app.get('/', (req, res) => {
});

// API endpoint for breakpoint chlorination
app.post('/api/calculate-breakpoint', (req, res) => {
    try {
      console.log("Server received in /api/calculate-breakpoint, req.body:", JSON.stringify(req.body, null, 2));

      // Get the input data from the request body (sent by the client)
      const { freeChlorine, totalChlorine, poolVolume, chlorineType } = req.body;

      if (!chlorineType || typeof chlorineType.concentration === 'undefined') {
        console.error('Error: chlorineType is missing or invalid in req.body:', chlorineType);
        return res.status(400).json({ error: "Invalid input: chlorineType is missing or malformed." });
    }
  
      // Perform the calculation using the server-side function
      const result = getBreakpointChlorination({
        freeChlorine,
        totalChlorine,
        poolVolume,
        chlorineType
      });
  
      // Send the result back to the client as JSON
      res.json(result);
    } catch (error) {
      console.error("Error in /api/calculate-breakpoint:", error);
      res.status(500).json({ error: "Failed to calculate breakpoint chlorination." });
    }
  });
  
  app.post('/api/calculate-water-balance', (req, res) => {
    try {
      // Log received data for debugging
      console.log("Server received in /api/calculate-water-balance, req.body:", JSON.stringify(req.body, null, 2));
  
      const {
        poolType,
        poolVolume,
        current,
        targets, 
        tempF,
        tds
      } = req.body;
  
      // Basic validation for required inputs
      if (!poolType || !poolVolume || !current || typeof tempF === 'undefined') {
        console.error('Error: Missing required fields for water balance calculation.', req.body);
        return res.status(400).json({ error: "Missing required fields (poolType, poolVolume, current values, tempF)." });
      }
  
      const result = getWaterBalanceSteps({
        poolType,
        poolVolume,
        current,
        targets: targets || {}, 
        tempF,
        tds: tds || 1000 
      });
  
      res.json(result); 
    } catch (error) {
      console.error("Detailed error in /api/calculate-water-balance:", error);
      res.status(500).json({ error: "Failed to calculate water balance steps." });
    }
  });
  app.post('/api/calculate-lsi', (req, res) => {
    try {
      console.log("Server received in /api/calculate-lsi, req.body:", JSON.stringify(req.body, null, 2));
      const { ph, tempF, calcium, alkalinity, cya, tds } = req.body;
  
      if (typeof ph === 'undefined' || typeof tempF === 'undefined' || typeof calcium === 'undefined' ||
          typeof alkalinity === 'undefined' || typeof cya === 'undefined') {
        return res.status(400).json({ error: "Missing required LSI parameters." });
      }
      const lsiData = getLSIFactors({ ph, tempF, calcium, alkalinity, cya, tds: tds || 1000 });
  
      res.json(lsiData); 
  
    } catch (error) {
      console.error("Detailed error in /api/calculate-lsi:", error);
      res.status(500).json({ error: "Failed to calculate LSI." });
    }
  });
  app.post('/api/calculate-salt-dose', (req, res) => {
    try {
      console.log("Server received in /api/calculate-salt-dose, req.body:", JSON.stringify(req.body, null, 2));
      const { currentSalt, targetSalt, poolVolume } = req.body;
  
      if (typeof currentSalt === 'undefined' || typeof targetSalt === 'undefined' || typeof poolVolume === 'undefined') {
        return res.status(400).json({ error: "Missing required salt dose parameters." });
      }
  
      const result = getSaltDose({
        currentSalt: parseFloat(currentSalt),
        targetSalt: parseFloat(targetSalt),
        poolVolume: parseFloat(poolVolume)
      });
  
      res.json(result); 
    } catch (error) {
      console.error("Detailed error in /api/calculate-salt-dose:", error);
      res.status(500).json({ error: "Failed to calculate salt dose." });
    }
  });

  // --- NEW API ENDPOINT for Chlorine Dose Table ---
app.post('/api/calculate-chlorine-dose-table', (req, res) => {
  console.log("Server received in /api/calculate-chlorine-dose-table, req.body:", JSON.stringify(req.body, null, 2));
  const {
      currentFC,
      poolVolume,
      chlorineTypeId, // 'liquid' or 'cal-hypo'
      chlorineConcentration, // e.g., 0.125 or 0.73
      minFC,
      maxFC,
      increment,
      poolType // 'pool' or 'spa'
  } = req.body;

  if (poolVolume <= 0 || chlorineConcentration <= 0) {
      return res.status(400).json({ error: "Invalid pool volume or chlorine concentration." });
  }

  const tableRows = [];
  for (let fc = minFC; fc <= maxFC; fc += increment) {
      const doseLbs = fc > currentFC
          ? ((fc - currentFC) * poolVolume * 0.00000834) / chlorineConcentration
          : 0;

      let doseDisplay = '-';
      if (doseLbs > 0.001) { // Only format if dose is significant
          doseDisplay = formatChlorineDose({
              lbs: doseLbs,
              poolType: poolType,
              chlorineType: chlorineTypeId
          });
      }
      tableRows.push({
          targetFC: fc.toFixed(2), // Keep FC formatting consistent
          doseDisplay: doseDisplay
      });
  }
  res.json({ tableRows });
});

// --- NEW API ENDPOINT for Formatting a Single Chlorine Dose ---
app.post('/api/format-chlorine-dose', (req, res) => {
  console.log("Server received in /api/format-chlorine-dose, req.body:", JSON.stringify(req.body, null, 2));
  const {
      lbs,
      poolType,
      chlorineTypeId // 'liquid' or 'cal-hypo'
  } = req.body;

  if (typeof lbs !== 'number' || lbs < 0) {
      return res.status(400).json({ error: "Invalid lbs value." });
  }
  if (!poolType || !chlorineTypeId) {
      return res.status(400).json({ error: "Missing poolType or chlorineTypeId." });
  }

  const formattedDose = formatChlorineDose({
      lbs,
      poolType,
      chlorineType: chlorineTypeId
  });
  res.json({ formattedDose });
});
// --- NEW API ENDPOINT for Sodium Thiosulfate Dose Table ---
app.post('/api/calculate-thiosulfate-table', (req, res) => {
  console.log("Server received in /api/calculate-thiosulfate-table, req.body:", JSON.stringify(req.body, null, 2));
  const { currentFC, poolVolume } = req.body;

  if (typeof currentFC !== 'number' || typeof poolVolume !== 'number' || poolVolume <= 0 || currentFC < 0) {
      console.error("Error in /api/calculate-thiosulfate-table: Invalid input parameters.", req.body);
      return res.status(400).json({ error: "Invalid input: currentFC must be a non-negative number, and poolVolume must be a positive number." });
  }

  try {
      const tableData = getThiosulfateDoseTableData(currentFC, poolVolume);
      res.json({ tableRows: tableData });
  } catch (error) {
      console.error("Exception in /api/calculate-thiosulfate-table:", error);
      res.status(500).json({ error: "Failed to calculate thiosulfate dose table." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Your application should now be accessible by opening a web browser to this address.');
  console.log('Make sure your index.html and all associated .js and .css files are in the "public" directory.');
});