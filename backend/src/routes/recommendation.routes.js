import { Router } from 'express';
import { 
  getRecommendations, 
  generateRecommendations, 
  acceptRecommendation, 
  dismissRecommendation,
  getPathRecommendations,
  generatePathRecommendations
} from '../controllers/recommendation.controller.js';

const router = Router();

router.get('/',                    getRecommendations);
router.post('/generate',           generateRecommendations);
router.put('/:id/accept',          acceptRecommendation);
router.put('/:id/dismiss',         dismissRecommendation);
router.get('/path/:pathId',        getPathRecommendations);
router.post('/path/:pathId/generate', generatePathRecommendations);

export default router;
