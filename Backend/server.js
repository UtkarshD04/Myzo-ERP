import 'dotenv/config';
import http from 'node:http';
import { connectDB } from './db/mongodb.js';
import { Employee } from './models/employeeModel.js';
import { requestHandler } from './services/router.js';
import { checkPendingQuotationFollowUps } from './services/followUpService.js';
import { runMonthlyPayrollAutoGeneration } from './services/payrollAutoGenService.js';

const PORT = process.env.PORT || 8080;
const FOLLOW_UP_CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly is frequent enough for a day(s)-scale reminder
const PAYROLL_AUTO_GEN_CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly; the service itself only acts once, on the 5th

connectDB()
  .then(() => Employee.init())
  .then(() => {
    checkPendingQuotationFollowUps().catch(err => console.error('Quotation follow-up check failed:', err.message));
    setInterval(() => {
      checkPendingQuotationFollowUps().catch(err => console.error('Quotation follow-up check failed:', err.message));
    }, FOLLOW_UP_CHECK_INTERVAL_MS);

    runMonthlyPayrollAutoGeneration().catch(err => console.error('Monthly payroll auto-generation failed:', err.message));
    setInterval(() => {
      runMonthlyPayrollAutoGeneration().catch(err => console.error('Monthly payroll auto-generation failed:', err.message));
    }, PAYROLL_AUTO_GEN_CHECK_INTERVAL_MS);

    const server = http.createServer(requestHandler);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
      }
      console.error(error);
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`MYZO ERP API running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
