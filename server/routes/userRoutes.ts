import { Router } from 'express';
import User from '../models/User';
import router from './authRoutes';

const allowedCategories = [
  'Food & Drink',
  'Art',
  'Music',
  'Sports & Fitness',
  'Hobbies'
];

// GET /user/me - get full authenticated user from DB
router.get('/user/me', (req, res) => {
  const user = req.user as any;
  if (!user) return res.status(401).send({ error: 'Not logged in' });

  User.findOne({ where: { email: user.email } })
    .then(dbUser => {
      if (!dbUser)
        return res.status(404).send({ error: 'User not found in DB' });
      res.status(200).send(dbUser);
    })
    .catch(err =>
      res.status(500).send({ error: 'Failed to fetch user', details: err })
    );
});

// PATCH /users/:userId - update name and profile picture
router.patch("/:userId", (req, res) => {
    const { userId } = req.params;
    const { name, profile_picture } = req.body;
  
    User.update(
      { name, profile_picture },
      { where: { id: userId } }
    )
      .then(([updatedRows]) => {
        if (updatedRows === 0) {
          res.status(404).json({ message: "User not found or unchanged" });
        } else {
          res.status(200).json({ message: "User updated" });
        }
      })
      .catch((err) => {
        console.error("PATCH /users/:userId error:", err);
        res.status(500).json({ message: "Server error" });
      });
  });



// POST /user/me - create a user if it doesnt exist (uses req.user from Google)
router.post('/user/me', (req, res) => {
  const user = req.user as User;
  if (!user) return res.status(401).send({ error: 'Not logged in' });

  const { categories, location, is_vendor } = req.body;

  // Validate categories and vendor type
  if (categories && !allowedCategories.includes(categories)) {
    return res.status(400).send({ error: 'Invalid category value.' });
  }

  if (is_vendor !== undefined && typeof is_vendor !== 'boolean') {
    return res.status(400).send({ error: '`is_vendor` must be a boolean.' });
  }

  // Find or create user
  User.findOne({ where: { email: user.email } })
    .then((existingUser: User | null) => {
      if (existingUser) {
        res
          .status(200)
          .send({ message: 'User already exists', user: existingUser });
        return;
      }

      return User.create({
        google_id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture ?? null,
        categories,
        location,
        is_vendor: is_vendor ?? false
      }).then(newUser => {
        res.status(201).send({ message: 'User created', user: newUser });
      });
    })
    .catch(err => {
      res
        .status(500)
        .send({ error: 'Failed to create/find user', details: err });
    });
});

// PATCH /user/me - update user preferences
router.patch('/user/me', (req, res) => {
  const user = req.user as User;
  if (!user) return res.status(401).send({ error: 'Not logged in' });

  const { categories, location, is_vendor } = req.body;

  if (categories && !allowedCategories.includes(categories)) {
    return res.status(400).send({ error: 'Invalid category value.' });
  }

  if (is_vendor !== undefined && typeof is_vendor !== 'boolean') {
    return res.status(400).send({ error: '`is_vendor` must be a boolean.' });
  }

  User.findOne({ where: { email: user.email } })
    .then((dbUser: any) => {
      if (!dbUser) {
        res.status(404).send({ error: 'User not found in DB' });
        return;
      }

      return dbUser.update({
        ...(categories !== undefined && { categories }),
        ...(location !== undefined && { location }),
        ...(is_vendor !== undefined && { is_vendor })
      });
    })
    .then(updatedUser => {
      if (!updatedUser) return;
      res.status(200).send({
        message: 'User preferences updated.',
        updated: {
          categories: updatedUser?.categories,
          location: updatedUser?.location,
          is_vendor: updatedUser?.is_vendor
        }
      });
    })
    .catch(err => {
      res.status(500).send({ error: 'Failed to update user', details: err });
    });
});

// DELETE /user/me - WILL DESTROY
router.delete('/user/me', (req, res) => {
  const user = req.user as any;
  if (!user) return res.status(401).send({ error: 'Not logged in' });

  User.destroy({ where: { email: user.email } })
    .then(deleted => {
      if (deleted) {
        res.status(200).send({ message: 'User deleted' });
      } else {
        res.status(404).send({ error: 'User not found' });
      }
    })
    .catch(err =>
      res.status(500).send({ error: 'Failed to delete user', details: err })
    );
});

export default router;
