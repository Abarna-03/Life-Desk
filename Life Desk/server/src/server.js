import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import assetsRoutes from './routes/assets.js';
import documentsRoutes from './routes/documents.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import maintenanceRoutes from './routes/maintenance.js';
import timelineRoutes from './routes/timeline.js';
import analyticsRoutes from './routes/analytics.js';
import notificationsRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'LifeHub / LifeDesk REST API',
    modules: ['LifeAdmin (Vault)', 'SubSave (Renewals)', 'FixFlow (Repairs)', 'Smart Timeline', 'Analytics'],
    timestamp: new Date(),
  });
});

// ===== Serve the built React frontend (single combined app) =====
// In production the Express server also serves the compiled client from
// client/dist, so the whole app runs from one process on one port.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // SPA fallback: send index.html for any non-API route so client-side
  // routing works on refresh / deep links.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.warn('⚠️  client/dist not found — run "npm run build" to serve the frontend from this server.');
}

app.listen(PORT, () => {
  const serving = fs.existsSync(clientDist) ? ' (serving app + API)' : ' (API only)';
  console.log(`🚀 LifeDesk running at http://localhost:${PORT}${serving}`);
});
