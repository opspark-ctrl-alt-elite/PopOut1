import { Router, Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Vendor from '../models/Vendor';
import User from '../models/User';

// Create a custom request type that allows req.user to be of any shape.
interface CustomRequest extends Request {
  user?: any;
}

const router = Router();

// Authentication middleware ensuring a logged in user.
const isAuthenticated = (req: CustomRequest, res: Response, next: NextFunction): void => {
  console.log('req.isAuthenticated():', req.isAuthenticated());
  console.log('req.user:', req.user);
  if (req.isAuthenticated() && req.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * POST /vendors/:vendorId/reviews
 * Creates a new review for a vendor. Only authenticated users can submit reviews.
 */
router.post('/vendors/:vendorId/reviews', isAuthenticated, async (req: CustomRequest, res: Response) => {
  const { vendorId } = req.params;
  console.log('Received vendorId:', vendorId); // Log the vendorId from the URL
  const { rating, comment } = req.body;
  const userId = req.user?.id;

  try {
    // Check if the vendor exists
    const vendor = await Vendor.findOne({ where: { id: vendorId } });
    if (!vendor) {
      console.log(`Vendor with id ${vendorId} not found in DB.`);
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Create the review.
    const newReview = await Review.create({
      rating,
      comment,
      user_id: userId,
      vendorId, // link the review to the vendor
    });
    return res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /vendors/:vendorId/reviews
 * Retrieves all reviews for a vendor, including user details for context.
 */
router.get('/vendors/:vendorId/reviews', async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  try {
    const reviews = await Review.findAll({
      where: { vendorId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'profile_picture'],
        },
      ],
    });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
