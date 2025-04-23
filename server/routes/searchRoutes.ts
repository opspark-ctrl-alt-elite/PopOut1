import { Router } from 'express';
import { Op } from 'sequelize';
import Vendor from '../models/Vendor';
import Event from '../models/EventModel';

const router = Router();

router.get('/', async (req, res) => {
  const { query, category } = req.query;

  console.log(`searching`);
  console.log(`query: "${query}"`);
  console.log(`cat: "${category}"`);

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'query err' });
  }

  try {
    if (category === 'vendors') {
      console.log('searching vendors');
      const vendors = await Vendor.findAll({
        where: {
          [Op.or]: [
            { businessName: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { website: { [Op.like]: `%${query}%` } },
            { instagram: { [Op.like]: `%${query}%` } },
            { facebook: { [Op.like]: `%${query}%` } },
          ]
        }
      });
      return res.json({ vendors });
    }

    if (category === 'events') {
      console.log('searching events');
      const events = await Event.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { venue_name: { [Op.like]: `%${query}%` } },
            { location: { [Op.like]: `%${query}%` } },
          ]
        }
      });
      return res.json({ events });
    }

    console.log('searching vendors, events');
    const [vendors, events] = await Promise.all([
      Vendor.findAll({
        where: {
          [Op.or]: [
            { businessName: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { website: { [Op.like]: `%${query}%` } },
            { instagram: { [Op.like]: `%${query}%` } },
            { facebook: { [Op.like]: `%${query}%` } },
          ]
        }
      }),
      Event.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { venue_name: { [Op.like]: `%${query}%` } },
            { location: { [Op.like]: `%${query}%` } },
          ]
        }
      })
    ]);

    console.log(`found ${vendors.length} vendors & ${events.length} events`);
    return res.json({ vendors, events });

  } catch (error) {
    console.error('err fetching search results', error);
    res.status(500).json({ error: 'server err' });
  }
});

export default router;
