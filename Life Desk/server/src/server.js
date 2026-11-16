import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.listen(PORT, () => {
  console.log(`🚀 LifeDesk API server running at http://localhost:${PORT}`);
});
