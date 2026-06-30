import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { register, login, logout, getMe, getGoogleUrl } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login',    authRateLimiter, login);
router.post('/logout',   logout);
router.get('/me',        getMe);
router.get('/google',    getGoogleUrl);

export default router;
