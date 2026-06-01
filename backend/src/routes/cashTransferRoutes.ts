import express from 'express';
import { getCashTransfers, createCashTransfer, deleteCashTransfer } from '../controllers/cashTransferController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCashTransfers);
router.post('/', createCashTransfer);
router.delete('/:id', deleteCashTransfer);

export default router;
