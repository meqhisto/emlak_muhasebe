import express from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // Protect all transaction routes

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
