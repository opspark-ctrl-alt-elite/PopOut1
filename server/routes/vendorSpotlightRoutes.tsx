import { Router, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../models/index';
import Vendor from '../models/Vendor';

const router = Router();

router.get('/spotlight/top3', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const topVendors = await sequelize.query<{
      id: string;
      businessName: string;
      description: string;
      profilePicture?: string;
      avgRating: number;
      reviewCount: number;
      score: number;
    }>(`
      SELECT
        v.id,
        v.businessName,
        v.description,
        v.profilePicture,
        COALESCE(AVG(r.rating), 0) as avgRating,
        COUNT(r.id) as reviewCount,
        SUM(
          CASE
            WHEN r.rating = 5 AND r.comment IS NOT NULL AND TRIM(r.comment) <> '' THEN 6
            WHEN r.rating = 5 THEN 5
            ELSE 0
          END
        ) as score
      FROM vendors v
      LEFT JOIN reviews r ON v.id = r.vendorId
        AND r.createdAt BETWEEN :startOfMonth AND :endOfMonth
      GROUP BY v.id
      ORDER BY score DESC, avgRating DESC
      LIMIT 3
    `, {
      replacements: { startOfMonth, endOfMonth },
      type: QueryTypes.SELECT,
    });

    return res.json(topVendors.map(vendor => ({
      ...vendor,
      averageRating: parseFloat(vendor.avgRating.toString()) || 0,
      reviewCount: parseInt(vendor.reviewCount.toString(), 10) || 0,
      score: parseInt(vendor.score.toString(), 10) || 0
    })));
  } catch (error) {
    console.error('Error fetching top vendors:', error); return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
export default router;