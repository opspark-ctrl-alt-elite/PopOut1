
import { Router, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../models/index';
import Review from '../models/Review';

const router = Router();

interface AggregationResult {
  avgRating: string;
  reviewCount: string;
}

interface VendorWithStats {
  id: string;
  businessName: string;
  description: string;
  profilePicture?: string;
  avgRating: string;
  reviewCount: string;
}

// Get average rating and review count for a specific vendor
router.get('/:vendorId/average-rating', async (req: Request, res: Response) => {
  const { vendorId } = req.params;

  try {
    const result = await sequelize.query<AggregationResult>(`
      SELECT 
        AVG(rating) as avgRating,
        COUNT(id) as reviewCount
      FROM Reviews
      WHERE vendorId = :vendorId
    `, {
      replacements: { vendorId },
      type: QueryTypes.SELECT,
    });

    const averageRating = parseFloat(result[0]?.avgRating || '0') || 0;
    const reviewCount = parseInt(result[0]?.reviewCount || '0', 10) || 0;

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

// Get top 3 vendors for spotlight
router.get('/spotlight/top3', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const topVendors = await sequelize.query<VendorWithStats>(`
      SELECT 
        v.id,
        v.businessName,
        v.description,
        v.profilePicture,
        COALESCE(AVG(r.rating), 0) as avgRating,
        COUNT(r.id) as reviewCount
      FROM Vendors v
      LEFT JOIN reviews r ON v.id = r.vendorId
        AND r.createdAt BETWEEN :startOfMonth AND :endOfMonth
      GROUP BY v.id
      ORDER BY avgRating DESC, reviewCount DESC
      LIMIT 3
    `, {
      replacements: { startOfMonth, endOfMonth },
      type: QueryTypes.SELECT,
    });

    // Format results with proper number types
    const formattedResults = topVendors.map(vendor => ({
      id: vendor.id,
      businessName: vendor.businessName,
      description: vendor.description,
      profilePicture: vendor.profilePicture,
      averageRating: parseFloat(vendor.avgRating) || 0,
      reviewCount: parseInt(vendor.reviewCount, 10) || 0
    }));

    return res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;