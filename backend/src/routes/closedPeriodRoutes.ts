import express from 'express';
import { getClosedPeriods, closePeriod, openPeriod } from '../controllers/closedPeriodController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getClosedPeriods);
router.post('/', closePeriod);
router.delete('/:id', openPeriod);

export default router;
