import { Router } from 'express';
import { getInterests, addInterests, updateInterest, deleteInterest } from '../controllers/interest.controller.js';
const router = Router();
router.get('/',        getInterests);
router.post('/',       addInterests);
router.put('/:id',    updateInterest);
router.delete('/:id', deleteInterest);
export default router;
