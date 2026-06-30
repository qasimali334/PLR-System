import { Router } from 'express';
import { generateQuiz, submitQuiz, getQuizHistory } from '../controllers/quiz.controller.js';
const router = Router();
router.post('/generate', generateQuiz);
router.post('/submit',   submitQuiz);
router.get('/history',   getQuizHistory);
export default router;
