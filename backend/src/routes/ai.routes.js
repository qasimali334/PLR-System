import { Router } from 'express';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';
import { chat, getInsights, generateWeeklyReport } from '../controllers/ai.controller.js';
const router = Router();
router.post('/chat',           aiRateLimiter, chat);
router.get('/insights',        aiRateLimiter, getInsights);
router.post('/weekly-report',  aiRateLimiter, generateWeeklyReport);
export default router;
