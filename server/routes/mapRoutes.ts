import { Router } from 'express';
import Event from '../models/Event';

const router = Router();

router.get('/api/map/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      attributes: ['id', 'title', 'latitude', 'longitude', 'venue_name', 'category'],
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'err fetching events' });
  }
});

export default router;