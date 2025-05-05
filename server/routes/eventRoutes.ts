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


router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isFree, isKidFriendly, isSober } = req.query;
    const where: any = {};

    if (isFree)        where.isFree        = isFree        === 'true';
    if (isKidFriendly) where.isKidFriendly = isKidFriendly === 'true';
    if (isSober)       where.isSober       = isSober       === 'true';

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

router.get('/my-events', ensureVendor, async (req: Request, res: Response) => {
  const vendor = (req as any).vendor;

  try {
    const events = await EventModel.findAll({
      where: { vendor_id: vendor.id },
      order: [['startDate', 'ASC']],
      include: [
        { model: Category, attributes: ['name'], through: { attributes: [] } }
      ]
    });
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
      title, description, startDate, endDate, venue_name,
      location, latitude, longitude,
      isFree, isKidFriendly, isSober,
      image_url, categories
    } = req.body;

    if (!title || !startDate || !endDate || !venue_name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const event = await EventModel.create({
      vendor_id: vendor.id,
      title, description, startDate, endDate,
      venue_name, location, latitude, longitude,
      isFree, isKidFriendly, isSober, image_url,
    });

    if (Array.isArray(categories)) {
      const catInstances = categories.length
        ? await Category.findAll({ where: { name: { [Op.in]: categories } } })
        : [];
      await (event as any).setCategories(catInstances);
    }


    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:id', ensureVendor, async (req: Request, res: Response) => {
  try {
    const vendor = (req as any).vendor;
    const event = await EventModel.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if ((event as any).vendor_id !== vendor.id) {
      return res.status(403).json({ error: 'You do not own this event' });
    }

    /* optional date check */
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    await event.update(req.body);


    if ('categories' in req.body && Array.isArray(req.body.categories)) {
      const catInstances = req.body.categories.length
        ? await Category.findAll({ where: { name: { [Op.in]: req.body.categories } } })
        : [];
      await (event as any).setCategories(catInstances);
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});


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

router.get('/vendor/:vendorId', async (req: Request, res: Response) => {
  try {
    const events = await EventModel.findAll({
      where: { vendor_id: req.params.vendorId },
      order: [['startDate', 'ASC']],
      include: [
        { model: Category, attributes: ['name'], through: { attributes: [] } }
      ],
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching vendor events:', error);
    res.status(500).json({ error: 'Failed to fetch vendor events' });
  }
});

export default router;
