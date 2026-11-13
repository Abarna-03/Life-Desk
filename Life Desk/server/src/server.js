import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', app: 'LifeDesk API', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 LifeDesk API server running at http://localhost:${PORT}`);
});