import express from 'express';
import { getSalaryPayments, createSalaryPayment, deleteSalaryPayment } from '../controllers/salaryPaymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSalaryPayments);
router.post('/', createSalaryPayment);
router.delete('/:id', deleteSalaryPayment);

export default router;
