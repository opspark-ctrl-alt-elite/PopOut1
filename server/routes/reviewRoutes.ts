import { Router, Request, Response } from 'express';
import Review from '../models/Review';
import Vendor from '../models/Vendor';
import User from '../models/User';

const router = Router();

// Minimal authenticate middleware
const authenticate = (req: Request, res: Response, next: Function) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

router.post('/:vendorId/reviews', authenticate, async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  const { rating, comment } = req.body;
  const userId = (req.user as User).id; // Using the user's id from authentication

  try {
    // Confirm the vendor exists.
    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    // Confirm the user exists in the DB.
    const user = await User.findByPk(userId);
    if (!user) {
      // This error indicates that the authentication process is returning a user ID that does not exist.
      return res.status(404).json({ error: 'User not found in the database.' });
    }

    // Check if a review from this user for this vendor already exists.
    const existingReview = await Review.findOne({ where: { vendorId, userId } });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this vendor.' });
    }

    // Create the review.
    const review = await Review.create({ rating, comment, userId, vendorId });
    res.status(201).json(review);
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get all reviews for a vendor
router.get('/:vendorId/reviews', async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  try {
    const reviews = await Review.findAll({
      where: { vendorId },
      include: [{
        model: User,
        attributes: ['id', 'name', 'profile_picture']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update a review
router.put('/:vendorId/reviews/:reviewId', authenticate, async (req: Request, res: Response) => {
  const { vendorId, reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = (req.user as User).id;

  try {
    const review = await Review.findOne({ 
      where: { id: reviewId, vendorId, userId } 
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    await review.update({ rating, comment });
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete a review
router.delete('/:vendorId/reviews/:reviewId', authenticate, async (req: Request, res: Response) => {
  const { vendorId, reviewId } = req.params;
  const userId = (req.user as User).id;

  try {
    const review = await Review.findOne({ 
      where: { id: reviewId, vendorId, userId } 
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    await review.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;