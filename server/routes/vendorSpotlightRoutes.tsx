import { Router, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../models/index';
import Vendor from '../models/Vendor';

const router = Router();

router.get('/spotlight/top3', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const topVendors = await sequelize.query(
      `
      SELECT v.*, r.score
      FROM vendors v
      JOIN (
        SELECT vendorId, SUM(
          IF(rating = 5,
            IF(comment IS NOT NULL AND TRIM(comment) <> '', 6, 5),
            0
          )
        ) AS score
        FROM Reviews
        WHERE createdAt BETWEEN :startOfMonth AND :endOfMonth
        GROUP BY vendorId
      ) r ON v.id = r.vendorId
      ORDER BY r.score DESC
      LIMIT 3;
      `,
      {
        replacements: { startOfMonth, endOfMonth },
        type: QueryTypes.SELECT,
      }
    );

    return res.json(topVendors);
  } catch (error: any) {
    console.error('Error fetching top vendors:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

export default router;