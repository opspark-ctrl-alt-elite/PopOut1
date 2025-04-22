import { Router } from 'express';
import { Category } from '../models/Category';

const router = Router();

// GET /categories - get list of all category names
router.get('/', async (_req, res) => {
  try {
    const categories = await Category.findAll({});
    res.json(categories);
  } catch (err) {
    console.error('Error loading categories:', err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

export default router;
