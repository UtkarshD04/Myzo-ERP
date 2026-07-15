import 'dotenv/config';
import http from 'node:http';
import { connectDB } from './db/mongodb.js';
import { requestHandler } from './services/router.js';

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
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
