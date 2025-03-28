import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { Op } from 'sequelize';
import Vendor from '../models/Vendor';
import User from '../models/User';
import { Event as EventModel } from '../models/EventModel';
import passport from 'passport';
const router = Router();

// Helper function to parse boolean query params safely
const parseBooleanParam = (value: any): boolean | undefined => {
  if (value === undefined) return undefined;
  return String(value).toLowerCase() === 'true';
};
interface AuthenticatedRequest extends Request {
  user: User;  // Now properly typed
}
function isAuthenticated(req: Request): req is Request & { user: User } {
  return req.isAuthenticated() && !!req.user;
}
// GET /events - Get a list of all events
router.get('/', async (req: Request, res: Response) => {
  try {
    // Log incoming query params for debugging
    console.log('Query params:', req.query);

    // Destructure and parse query params
    const {
      category,
      isFree,
      isKidFriendly,
      isSober,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause for filtering
    const whereClause: any = {};

    if (category) whereClause.category = category;
    if (isFree !== undefined) whereClause.isFree = parseBooleanParam(isFree);
    if (isKidFriendly !== undefined)
      whereClause.isKidFriendly = parseBooleanParam(isKidFriendly);
    if (isSober !== undefined) whereClause.isSober = parseBooleanParam(isSober);

    // Date range filtering (with validation)
    if (startDate || endDate) {
      whereClause.startDate = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate as string);
        if (isNaN(parsedStartDate.getTime())) {
          return res.status(400).json({
            message:
              'Invalid startDate format. Use ISO format (e.g., YYYY-MM-DD).'
          });
        }
        whereClause.startDate[Op.gte] = parsedStartDate;
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate as string);
        if (isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({
            message:
              'Invalid endDate format. Use ISO format (e.g., YYYY-MM-DD).'
          });
        }
        whereClause.startDate[Op.lte] = parsedEndDate;
      }
    }

    // Log final whereClause for debugging
    console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);

    // Fetch events with filtering and pagination
    const { count, rows: events } = await EventModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Vendor,
          attributes: ['businessName']
        }
      ],
      limit: Number(limit),
      offset: offset,
      order: [['startDate', 'ASC']]
    });

    // Log results (for debugging)
    console.log(`Found ${count} events. Returning ${events.length} events.`);

    // Send response
    res.json({
      total: count,
      page: Number(page),
      limit: Number(limit),
      events: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      message: 'Failed to retrieve events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
// POST /events - Create a new event
// POST /events - Create a new event
router.post(
  '/',
  // Authentication middleware
  (req: Request, res: Response, next: NextFunction) => {
    console.log('[1] Starting authentication middleware');
    console.log(`[1] Request headers: ${JSON.stringify(req.headers)}`);
    console.log(`[1] Session ID: ${req.sessionID}`);

    if (isAuthenticated(req)) {
      console.log('[1] User is already authenticated:', req.user);
      return next();
    }
    
    // Check for API token in header
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      console.log('[1] Found Authorization header');
      const token = authHeader.split(' ')[1];
      
      if (token === process.env.API_SECRET) {
        console.log('[1] Valid API token received');
        req.user = Object.assign(new User(), {
          id: '1',
          is_vendor: true,
          google_id: 'system',
          email: 'system@example.com',
          name: 'System User'
        });
        console.log('[1] Created system user:', req.user);
        return next();
      } else {
        console.log('[1] Invalid API token');
      }
    } else {
      console.log('[1] No valid Authorization header found');
    }

    console.log('[1] Attempting Google authentication');
    passport.authenticate('google', { 
      session: false,
      failureRedirect: undefined
    }, (err: Error, user: User | false, info?: any) => {
      console.log('[1] Google auth callback executed');
      if (err) {
        console.error('[1] Google auth error:', err);
        return next(err);
      }
      if (!user) {
        console.log('[1] Google auth failed. Info:', info);
        return res.status(401).json({ 
          error: 'Please log in first',
          loginUrl: '/auth/google' 
        });
      }
      console.log('[1] Google auth successful. User:', user);
      req.user = user;
      next();
    })(req, res, next);
  },
  // Vendor check
  (req: Request, res: Response, next: NextFunction) => {
    console.log('[2] Starting vendor check middleware');
    console.log(`[2] Current user: ${JSON.stringify(req.user)}`);

    if (!isAuthenticated(req)) {
      console.log('[2] User not authenticated in vendor check');
      return res.status(403).json({ 
        error: 'Authentication required',
        loginUrl: '/auth/google' 
      });
    }

    if (!req.user.is_vendor) {
      console.log('[2] User is not a vendor');
      return res.status(403).json({ 
        error: 'Vendor account required',
        upgradeUrl: '/account/upgrade' 
      });
    }

    console.log('[2] Vendor check passed');
    next();
  },
  // Event creation
  async (req: Request, res: Response) => {
    try {
      console.log('[3] Starting event creation handler');
      console.log(`[3] Request body: ${JSON.stringify(req.body)}`);
      
      if (!isAuthenticated(req)) {
        console.error('[3] Unexpected unauthenticated request in handler');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, startDate } = req.body;
      
      if (!name || !startDate) {
        console.log('[3] Missing required fields:', { name, startDate });
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['name', 'startDate'],
          received: { name, startDate }
        });
      }

      console.log('[3] Creating event with data:', {
        name,
        startDate,
        vendorId: req.user.id
      });

      const event = await EventModel.create({
        name,
        startDate: new Date(startDate),
        vendorId: req.user.id
      });

      console.log('[3] Event created successfully:', event);
      res.status(201).json(event);
    } catch (error) {
      console.error('[3] Event creation error:', error);
      res.status(500).json({ 
        error: 'Failed to create event',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

// Add a final catch-all for requests that slip through
router.use((req: Request, res: Response) => {
  console.error('Request slipped through all handlers!', {
    method: req.method,
    path: req.path,
    authenticated: req.isAuthenticated(),
    user: req.user
  });
  res.status(500).json({ error: 'Unexpected server error' });
});
export default router;
