import { Router, Request, Response } from 'express';
import Review from '../models/Review';
import Vendor from '../models/Vendor';
import User from '../models/User';
import  sequelize  from '../models/index'; 
const router = Router();

// Enhanced authenticate middleware
const authenticate = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Please login to perform this action'
    });
  }
  next();
};

// GET all reviews for a vendor
router.get('/:vendorId/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      where: { vendorId: req.params.vendorId },
      include: [{
        model: User,
        as: 'user', // This must match the association alias
        attributes: ['id', 'name', 'profile_picture']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST a new review
router.post('/:vendorId/reviews', authenticate, async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { vendorId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req.user as User).id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid rating value' });
    }

    // Verify vendor exists
    const vendor = await Vendor.findByPk(vendorId, { transaction });
    if (!vendor) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Verify user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ 
      where: { userId, vendorId },
      transaction
    });
    
    if (existingReview) {
      await transaction.rollback();
      return res.status(409).json({ error: 'You have already reviewed this vendor' });
    }

    // Create review
    const review = await Review.create({
      rating,
      comment: comment || null,
      userId,
      vendorId
    }, { transaction });

    // Fetch the complete review with user data
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile_picture']
      }],
      transaction
    });

    await transaction.commit();
    res.status(201).json(reviewWithUser);
  } catch (error) {
    await transaction.rollback();
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        message: error,
        stack: error
      } : undefined
    });
  }
});

export default router;