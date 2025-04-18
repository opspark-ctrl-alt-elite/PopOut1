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

// get bookmarked events
router.get('/users/:userId/bookmarked-events', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const events = await user.getBookmarkedEvents({
      include: [{ model: Vendor, as: 'vendor' }],
    });

    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching bookmarked events:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarked events' });
  }
});

// unbookmark
router.delete('/users/:userId/unbookmark/:eventId', async (req, res) => {
    const { userId, eventId } = req.params;
    try {
      const user = await User.findByPk(userId);
      const event = await Event.findByPk(eventId);
      if (!user || !event) return res.status(404).json({ error: 'Not found' });
  
      await user.removeBookmarkedEvent(event); 
      res.status(200).json({ message: 'Event unbookmarked' });
    } catch (err) {
      console.error('Error unbookmarking event:', err);
      res.status(500).json({ error: 'Failed to unbookmark event' });
    }
  });
export default router;

// mount caucasia 