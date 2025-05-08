import { Router } from 'express';
import passport from '../auth';

const router = Router();

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/',
  })
);

router.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

router.get('/auth/me', (req, res) => {
  res.send(req.user || 'not logged in');
});

export default router;