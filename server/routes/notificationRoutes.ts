import { Router } from "express";
import User from '../models/User';

const router = Router();

// POST
router.post('/register-token', async (req, res) => {
  const { token, userId } = req.body;

  try {
    await User.update({ fcm_token: token }, { where: { id: userId } });
    res.status(200).json({ message: 'token saved' });
  } catch (err) {
    console.error('fail saving token', err);
    res.status(500);
  }
});

export default router;