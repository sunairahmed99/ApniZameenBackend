import express from 'express';
import { createDeal, getDeals, updateDeal, deleteDeal } from '../controllers/dealController.js';

const router = express.Router();

router.post('/', createDeal);
router.get('/', getDeals);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;
