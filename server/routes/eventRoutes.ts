import { Router, Request, Response, NextFunction } from 'express';
import { Event as EventModel } from '../models/EventModel';
import Vendor from '../models/Vendor';
import Category from '../models/Category';
import { Op } from 'sequelize';
import { messaging } from '../../src/firebase/firebaseAdmin';
import User from '../models/User';

const router = Router();

function isAuthenticated(req: Request): req is Request & { user: any } {
  return req.isAuthenticated() && !!req.user;
}

const ensureVendor = async (req: Request, res: Response, next: NextFunction) => {
  if (!isAuthenticated(req)) return res.status(403).json({ error: 'Authentication required' });
  if (!req.user.is_vendor) return res.status(403).json({ error: 'Vendor access required' });

  const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
  if (!vendor) return res.status(403).json({ error: 'Vendor profile not found' });

  // @ts-ignore
  req.vendor = vendor;
  next();
};

// 🌐 PUBLIC: GET /events (with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isFree, isKidFriendly, isSober } = req.query;
    const where: any = {};

    if (isFree) where.isFree = isFree === 'true';
    if (isKidFriendly) where.isKidFriendly = isKidFriendly === 'true';
    if (isSober) where.isSober = isSober === 'true';

    const events = await EventModel.findAll({
      where,
      include: [
        {
          model: Category,
          where: category ? { name: category } : undefined,
          required: !!category,
          through: { attributes: [] },
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'businessName'],
        },
      ],
      order: [['startDate', 'ASC']],
    });
    res.json(events);
  } catch (err) {
    console.error('Public event feed error:', err);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// GET /events/my-events (for the logged-in vendor)
router.get('/my-events', ensureVendor, async (req: Request, res: Response) => {
  const vendor = (req as any).vendor;

  try {
    const events = await EventModel.findAll({
      where: { vendor_id: vendor.id },
      order: [['startDate', 'ASC']],
      include: [
        {
          model: Category,
          attributes: ['name'],
          through: { attributes: [] }
        }
      ]
    });
    console.log(JSON.stringify(events, null, 2));
    res.json(events);
  } catch (error) {
    console.error('Error fetching vendor events:', error);
    res.status(500).json({ error: 'Failed to fetch vendor events' });
  }
});

router.post('/', ensureVendor, async (req: Request, res: Response) => {
  try {
    const vendor = (req as any).vendor;
    const {
      title,
      description,
      startDate,
      endDate,
      venue_name,
      location,
      latitude,
      longitude,
      isFree,
      isKidFriendly,
      isSober,
      image_url,
      categories,
    } = req.body;

    if (!title || !startDate || !endDate || !venue_name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // create event
    const event = await EventModel.create({
      vendor_id: vendor.id,
      title,
      description,
      startDate,
      endDate,
      venue_name,
      location,
      latitude,
      longitude,
      isFree,
      isKidFriendly,
      isSober,
      image_url,
    });

    // categories
    if (categories && Array.isArray(categories)) {
      const categoryInstances = await Category.findAll({ where: { name: categories } });
      await (event as any).setCategories(categoryInstances);
    }

    // followers fcm tokens
    const vendorWithFollowers = await Vendor.findByPk(vendor.id, {
      include: {
        model: User,
        as: 'followers',
        where: { fcm_token: { [Op.ne]: null } },
        required: false,
        attributes: ['id', 'name', 'fcm_token'],
      },
    });

    if (!vendorWithFollowers) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const followers = (vendorWithFollowers as any).followers;

    if (followers && followers.length > 0) {
      const notifications = followers.map((user: any) => ({
        token: user.fcm_token,
        notification: {
          title: `${vendorWithFollowers.businessName} just posted a new event!`,
          body: `${title} is happening soon - check it out in PopOut.`,
        },
      }));

      const results = await Promise.allSettled(
        notifications.map((msg: any) => messaging.send(msg))
      );

      const sentCount = results.filter((r: any) => r.status === 'fulfilled').length;
      console.log(`EVENT CREATED ${sentCount} FOLLOWERS NOTIFIED.`);

      results.forEach((r: any, i: number) => {
        if (r.status === 'rejected') {
          console.warn(`failed to notify user ${notifications[i].token}`, r.reason);
        }
      });
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// router.post('/', ensureVendor, async (req: Request, res: Response) => {
//   try {
//     const vendor = (req as any).vendor;
//     const {
//       title,
//       description,
//       startDate,
//       endDate,
//       venue_name,
//       latitude,
//       longitude,
//       isFree,
//       isKidFriendly,
//       isSober,
//       image_url,
//       categories
//     } = req.body;

//     // Required field validation
//     if (!title || !startDate || !endDate || !venue_name || !latitude || !longitude) {
//       return res.status(400).json({ error: 'Missing required event fields' });
//     }

//     if (new Date(endDate) <= new Date(startDate)) {
//       return res.status(400).json({ error: 'End date must be after start date' });
//     }

//     const event = await EventModel.create({
//       vendor_id: vendor.id,
//       title,
//       description,
//       startDate,
//       endDate,
//       venue_name,
//       latitude,
//       longitude,
//       isFree,
//       isKidFriendly,
//       isSober,
//       image_url,
//     });

//     if (categories && Array.isArray(categories)) {
//       const categoryInstances = await Category.findAll({ where: { name: categories } });
//       await (event as any).setCategories(categoryInstances);
//     }

//     res.status(201).json(event);
//   } catch (error) {
//     console.error('Error creating event:', error);
//     res.status(500).json({ error: 'Failed to create event' });
//   }
// });

router.put('/:id', ensureVendor, async (req: Request, res: Response) => {
  try {
    const vendor = (req as any).vendor;
    const event = await EventModel.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if ((event as any).vendor_id !== vendor.id) {
      return res.status(403).json({ error: 'You do not own this event' });
    }

    // Optional: validate date logic if both provided
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    await event.update(req.body);

    if (req.body.categories && Array.isArray(req.body.categories)) {
      const categoryInstances = await Category.findAll({ where: { name: req.body.categories } });
      await (event as any).setCategories(categoryInstances);
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /events/:id
router.delete('/:id', ensureVendor, async (req: Request, res: Response) => {
  try {
    const vendor = (req as any).vendor;
    const event = await EventModel.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if ((event as any).vendor_id !== vendor.id) {
      return res.status(403).json({ error: 'You do not own this event' });
    }

    await event.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// GET /events/vendor/:vendorId
router.get('/vendor/:vendorId', async (req: Request, res: Response) => {
  try {
    const events = await EventModel.findAll({
      where: { vendor_id: req.params.vendorId },
      order: [['startDate', 'ASC']],
      include: [
        {
          model: Category,
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching vendor events:', error);
    res.status(500).json({ error: 'Failed to fetch vendor events' });
  }
});

export default router;