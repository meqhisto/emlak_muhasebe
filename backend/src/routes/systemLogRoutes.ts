import express from 'express';
import { getLogs, createLog } from '../controllers/systemLogController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLogs);
router.post('/', createLog);

export default router;
