import express from 'express';
import { getPersonnel, createPersonnel, updatePersonnel, deletePersonnel } from '../controllers/personnelController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getPersonnel);
router.post('/', createPersonnel);
router.put('/:id', updatePersonnel);
router.delete('/:id', deletePersonnel);

export default router;
