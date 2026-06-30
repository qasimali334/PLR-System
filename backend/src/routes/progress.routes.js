import { Router } from 'express';
import { getProgress, logProgress, getStreak, getStats } from '../controllers/progress.controller.js';
const router = Router();
router.get('/',       getProgress);
router.get('/streak', getStreak);
router.get('/stats',  getStats);
router.post('/log',   logProgress);
export default router;
