import { Router, Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Vendor from '../models/Vendor';
import User from '../models/User';
import sequelize from '../models/index';
import { QueryTypes } from 'sequelize';

const router = Router();

// Debug endpoint to create test vendor
router.post('/debug/create-test-vendor', async (req: Request, res: Response) => {
  try {
    // First check if vendor already exists
    const existingVendor = await Vendor.findByPk('d64cfda1-5e4a-4196-a605-309c261b75aa');
    if (existingVendor) {
      return res.status(400).json({ 
        error: 'Vendor already exists',
        vendor: existingVendor 
      });
    }

    // Get any user to associate
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ error: 'No users exist in database' });
    }

    // Create test vendor
    const vendor = await Vendor.create({
      id: 'd64cfda1-5e4a-4196-a605-309c261b75aa',
      businessName: 'Test Vendor',
      email: `testvendor${Math.random().toString(36).substring(2, 7)}@example.com`,
      description: 'Automatically created test vendor',
      userId: user.id
    });

    res.status(201).json({
      message: 'Test vendor created successfully',
      vendor
    });
  } catch (error) {
    console.error('Error creating test vendor:', error);
    res.status(500).json({ 
      error: 'Failed to create test vendor',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Submit a review
router.post('/vendors/:vendorId/reviews', isAuthenticated, async (req: Request, res: Response) => {
  console.log("REACHED THE ROUTE"); 
  const { vendorId } = req.params;
  const { rating, comment } = req.body;
  const userId = (req.user as any).id;

  try {
    // Case-sensitive lookup
    const vendor = await Vendor.findOne({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({ 
        error: 'Vendor not found',
        receivedId: vendorId
      });
    }

    // Create review
    const review = await Review.create({
      rating,
      comment,
      userId,
      vendorId
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Review creation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get reviews
router.get('/vendors/:vendorId/reviews', async (req: Request, res: Response) => {
  const { vendorId } = req.params;

  try {
    const reviews = await Review.findAll({
      where: { vendorId },
      include: [{
        model: User,
        attributes: ['id', 'name', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
// Update a review
router.put('/vendors/:vendorId/reviews/:reviewId', isAuthenticated, async (req: Request, res: Response) => {
  const { vendorId, reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = (req.user as any).id;

  try {
    const review = await Review.findOne({
      where: { id: reviewId, vendorId, userId }
    });

    if (!review) {
      return res.status(404).json({ 
        error: 'Review not found or unauthorized' 
      });
    }

    await review.update({ rating, comment });
    return res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete a review
router.delete('/vendors/:vendorId/reviews/:reviewId', isAuthenticated, async (req: Request, res: Response) => {
  const { vendorId, reviewId } = req.params;
  const userId = (req.user as any).id;

  try {
    const review = await Review.findOne({
      where: { id: reviewId, vendorId, userId }
    });

    if (!review) {
      return res.status(404).json({ 
        error: 'Review not found or unauthorized' 
      });
    }

    await review.destroy();
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
export default router;