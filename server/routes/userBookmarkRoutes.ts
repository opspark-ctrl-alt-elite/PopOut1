import { Router } from 'express';
import User from '../models/User';
import { Category } from '../models/Category';
import router from './authRoutes';
import Vendor from '../models/Vendor';
import Event from '../models/EventModel';

// bookmark an event
router.post('/:userId/bookmark/:eventId', async (req, res) => {
  const { userId, eventId } = req.params;
  console.log('Received POST /bookmark with userId:', userId, 'eventId:', eventId);

  try {
    const user = await User.findByPk(userId);
    const event = await Event.findByPk(eventId);

    console.log('User:', user ? 'found' : 'not found');
    console.log('Event:', event ? 'found' : 'not found');

    if (!user || !event) {
      return res.status(404).json({ error: 'Not found' });
    }

    await user.addBookmarkedEvent(event);
    res.status(200).json({ message: 'Event bookmarked successfully' });

  } catch (err) {
    console.error('Error bookmarking event:', err);
    res.status(500).json({ error: 'Failed to bookmark event' });
  }
});

router.get('/users/:userId/bookmarked-events', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const events = await user.getBookmarkedEvents(); // Mixin from association
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching bookmarked events:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarked events' });
  }
});
export default router;
