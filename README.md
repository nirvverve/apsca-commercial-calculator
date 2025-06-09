# apsca-commercial-calculator
v0.5.0 improvements, test release for commercial aquatics (06/09/2025)

Moved core calculation logic to server-side APIs:
   Chlorine Dose Table
   Expert Mode Chlorine Formatting
   Sodium Thiosulfate Calculator
   Consolidating LSI calculations to use the API exclusively

Introduction of new API endpoints to support these calculations.

Refactoring client-side JavaScript (public/script.js) to utilize these new APIs, making it leaner for these specific tasks.

Minor fixes/improvements like the LSI display alignment as part of the refactoring.


v0.4.0 initial test release (06/08/2025)

Refactored breakpoint chlorination, core water balance calculations (expert / standard modes), LSI calculations and salt dose to server.

minor bugs and UX fixes 

