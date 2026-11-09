// External libraries
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import requestIp from 'request-ip';
import fs from 'fs';
import https from 'https';

// Load environment variables
const ENV_PATH = './config/.env'
dotenv.config({ path: ENV_PATH });

// Use an async function to handle async imports and initialization
async function startServer() {
  const { redirectHomePath, redirectPathsEndingInHtml } = await import('./handlers/middleware/redirects.js');
  const { logPageVisit } = await import('./handlers/middleware/log-page-visit.js');
  const publicRoutes = (await import('./routes/public.js')).default;
  const authRoutes = (await import('./routes/auth.js')).default;
  const siteVisitsRoutes = (await import('./routes/site-visits.js')).default;

  // Get the directory of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const __publicDir = path.join(__dirname, '../public');

  // Initialize the Express app
  const app = express();

  // Security-related middleware
  // app.use(helmet());

  // Middleware to parse incoming requests
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Middleware for request processing and logging
  app.use(cookieParser());
  app.use(requestIp.mw());
  app.use(logPageVisit);

  // Middleware for redirects and static files
  app.use(redirectPathsEndingInHtml);
  app.use(redirectHomePath);
  app.use(express.static(__publicDir, { index: false }));

  // Routers
  app.use('/', publicRoutes);
  app.use('/admin', authRoutes);
  app.use('/site-visits', siteVisitsRoutes);

  // Create the server
  const server = https.createServer(
    {
      cert: fs.readFileSync(process.env.TLS_CERT_PATH),
      key: fs.readFileSync(process.env.TLS_KEY_PATH),
    },
    app
  ).listen(process.env.PORT, () => {
    console.log(`Starting Node.js server...\nThe server is listening on port ${process.env.PORT}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});
