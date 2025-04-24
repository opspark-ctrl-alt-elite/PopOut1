import { Router, Request, Response } from 'express';
import Review from '../models/Review';
import Vendor from '../models/Vendor';
import User from '../models/User';
import sequelize from '../models/index';
import { Sequelize, ValidationError } from 'sequelize'; // Updated import
import { Transaction } from 'sequelize';
import { QueryTypes } from 'sequelize';

const router = Router();

const authenticate = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please login to perform this action'
    });
  }
  next();
};

interface AggregationResult {
  avgRating: string | null;
  totalReviews: string | null;
}



// Add this to your review routes
router.get('/:vendorId/average-rating', async (req: Request, res: Response) => {
  try {
    const result = await sequelize.query<AggregationResult>(`
      SELECT
        AVG(rating) as avgRating,
        COUNT(id) as totalReviews
      FROM reviews
      WHERE vendorId = :vendorId
    `, {
      replacements: { vendorId: req.params.vendorId },
      type: QueryTypes.SELECT,
    });

    const averageRating = parseFloat(result[0]?.avgRating || '0') || 0;
    const reviewCount = parseInt(result[0]?.totalReviews || '0', 10) || 0;

    return res.json({
      averageRating,
      reviewCount
    });
  } catch (error) {
    console.error('Error computing average rating:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get('/:vendorId/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      where: { vendorId: req.params.vendorId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile_picture']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/:vendorId/reviews', authenticate, async (req: Request, res: Response) => {
  let transaction: Transaction | null = null;

  try {
    transaction = await sequelize.transaction();
    const { vendorId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req.user as User).id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({ error: 'Invalid rating value' });
    }

    // Verify vendor exists
    const vendor = await Vendor.findByPk(vendorId, { transaction });
    if (!vendor) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Verify user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      where: { userId, vendorId },
      transaction
    }); if (existingReview) {
      if (transaction) await transaction.rollback();
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

    if (transaction) await transaction.commit();
    return res.status(201).json(reviewWithUser);

  } catch (error: any) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Transaction rollback failed:', rollbackError);
      }
    }

    console.error('Error in review creation:', error);if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e: any) => e.message)
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});



router.put('/:vendorId/reviews/:reviewId', authenticate, async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { reviewId, vendorId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req.user as User).id;

    if (!rating || rating < 1 || rating > 5) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid rating value' });
    }

    const review = await Review.findOne({
      where: { id: reviewId, vendorId, userId },
      transaction
    }); if (!review) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.update({ rating, comment }, { transaction });

    const updatedReview = await Review.findByPk(reviewId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile_picture']
      }],
      transaction
    });

    await transaction.commit();
    res.json(updatedReview);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating review:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

router.delete('/:vendorId/reviews/:reviewId', authenticate, async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { reviewId, vendorId } = req.params;
    const userId = (req.user as User).id;

    const review = await Review.findOne({
      where: { id: reviewId, vendorId, userId },
      transaction
    });if (!review) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.destroy({ transaction });
    await transaction.commit();
    res.status(204).end();
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting review:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;