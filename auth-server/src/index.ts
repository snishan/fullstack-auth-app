import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error';
import { prisma } from './config/prisma';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); 

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Auth API is running' });
});
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  async function startServer() {
    try {
      await prisma.$connect();
      console.log('Connected to PostgreSQL');
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default app;