import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { authMiddleware } from './middleware/auth.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import interestRoutes from './routes/interest.routes.js';
import pathRoutes from './routes/path.routes.js';
import progressRoutes from './routes/progress.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import aiRoutes from './routes/ai.routes.js';
import resourceRoutes from './routes/resource.routes.js';

const app = express();

// Security & utilities
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', globalRateLimiter);

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users',           authMiddleware, userRoutes);
app.use('/api/interests',       authMiddleware, interestRoutes);
app.use('/api/paths',           authMiddleware, pathRoutes);
app.use('/api/progress',        authMiddleware, progressRoutes);
app.use('/api/quiz',            authMiddleware, quizRoutes);
app.use('/api/recommendations', authMiddleware, recommendationRoutes);
app.use('/api/ai',              authMiddleware, aiRoutes);
app.use('/api/resources',       authMiddleware, resourceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PLR-System API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
