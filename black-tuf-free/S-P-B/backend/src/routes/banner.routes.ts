import { Router } from 'express';
import Banner from '../models/Banner';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }
      ]
    })
      .sort({ order: 1 })
      .limit(10);
    res.json({ status: 'success', results: banners.length, data: { banners } });
  } catch (err) {
    next(err);
  }
});

export default router;
