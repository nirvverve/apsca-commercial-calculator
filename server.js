process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { calculateLSIAndAdvice } = require('./calculator'); 
const app = express();
const PORT = 3000; // or whatever port you use

app.use(express.static(path.join(__dirname))); // serves your HTML, JS, CSS
app.use(bodyParser.json()); // lets Express read JSON sent from the browser
app.post('/api/calculate', (req, res) => {
    try {
        const result = calculateLSIAndAdvice(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Calculation error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});