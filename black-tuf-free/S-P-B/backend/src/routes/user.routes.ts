import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getUserAddresses, getUserProfile, registerDeviceToken, unregisterDeviceToken } from '../controllers/user.controller';

const router = Router();

router.use(protect);

router.get('/addresses', getUserAddresses);
router.get('/profile', getUserProfile);
router.post('/device-token', registerDeviceToken);
router.delete('/device-token', unregisterDeviceToken);

export default router;


