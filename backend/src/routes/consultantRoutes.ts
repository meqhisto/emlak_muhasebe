import express from 'express';
import { getConsultants, createConsultant, updateConsultant, deleteConsultant } from '../controllers/consultantController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getConsultants);
router.post('/', createConsultant);
router.put('/:id', updateConsultant);
router.delete('/:id', deleteConsultant);

export default router;
