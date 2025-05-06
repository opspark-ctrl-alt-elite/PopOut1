// routes/vendorSpotlight.ts
import { Router, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../models/index';

const router = Router();

/**
 * GET /api/vendors/spotlight/top5
 * Returns the five highest‑scoring vendors this month.
 * Score = 6 for every 5‑star review **with** a non‑empty comment,
 *         5 for every plain 5‑star review.
 */
router.get('/spotlight/top5', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

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
        COALESCE(AVG(r.rating), 0) AS avgRating,
        COUNT(r.id)                AS reviewCount,
        SUM(
          CASE
            WHEN r.rating = 5 AND r.comment IS NOT NULL AND TRIM(r.comment) <> '' THEN 6
            WHEN r.rating = 5 THEN 5
            ELSE 0
          END
        ) AS score
      FROM vendors v
      LEFT JOIN reviews r
        ON v.id = r.vendorId
        AND r.createdAt BETWEEN :startOfMonth AND :endOfMonth
      GROUP BY v.id
      ORDER BY score DESC, avgRating DESC
      LIMIT 5
    `, {
      replacements: { startOfMonth, endOfMonth },
      type: QueryTypes.SELECT,
    });

    return res.json(
      topVendors.map(v => ({
        id:            v.id,
        businessName:  v.businessName,
        description:   v.description,
        profilePicture:v.profilePicture,
        averageRating: parseFloat(v.avgRating.toString()) || 0,
        reviewCount:   parseInt(v.reviewCount.toString(), 10) || 0,
        score:         parseInt(v.score.toString(), 10)       || 0,
      }))
    );
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    return res.status(500).json({
      error:   'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/vendors/:vendorId/average-rating
 * Returns avg rating & review count for a single vendor.
 */
router.get('/:vendorId/average-rating', async (req: Request, res: Response) => {
  const { vendorId } = req.params;

  try {
    const [stats] = await sequelize.query<{
      avgRating:   string;
      reviewCount: string;
    }>(`
      SELECT
        AVG(rating) AS avgRating,
        COUNT(id)   AS reviewCount
      FROM reviews
      WHERE vendorId = :vendorId
    `, {
      replacements: { vendorId },
      type: QueryTypes.SELECT,
    });

    return res.json({
      averageRating: parseFloat(stats?.avgRating ?? '0')      || 0,
      reviewCount:   parseInt(stats?.reviewCount ?? '0', 10) || 0,
    });
  } catch (error) {
    console.error('Error computing average rating:', error);
    return res.status(500).json({
      error:   'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
