import { Router } from 'express';
import User from '../models/User';
import { Category } from '../models/Category';
import router from './authRoutes';
import Vendor from '../models/Vendor';
import Event from '../models/EventModel';

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


  // PATCH Preferences 
  router.patch('/users/:userId/preferences', (req, res) => {
    const { userId } = req.params;
    const { categories, location, is_vendor } = req.body;
  
    // Validate inputs
    if (categories && !Array.isArray(categories)) {
      return res.status(400).json({ error: 'Categories must be an array.' });
    }
  
    if (is_vendor !== undefined && typeof is_vendor !== 'boolean') {
      return res.status(400).json({ error: '`is_vendor` must be a boolean.' });
    }
  
    // Step 1: Find the user
    User.findByPk(userId)
      .then((user) => {
        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return; // stop here
        }
  
        // Step 2: Update location and vendor status
        return user.update({ location, is_vendor })
          .then(() => {
            // Step 3: If categories are provided, update them
            if (categories && categories.length > 0) {
              return Category.findAll({
                where: {
                  name: categories
                }
              }).then((categoryInstances) => {
                return user.setCategories(categoryInstances)
                  .then(() => user.getCategories())
                  .then((updatedCategories) => {
                    res.status(200).json({
                      message: 'Preferences updated successfully.',
                      updated: {
                        location: user.location,
                        is_vendor: user.is_vendor,
                        categories: updatedCategories
                      }
                    });
                  });
              });
            } else {
              // No categories to update
              res.status(200).json({
                message: 'Preferences updated successfully.',
                updated: {
                  location: user.location,
                  is_vendor: user.is_vendor
                }
              });
            }
          });
      })
      .catch((err) => {
        console.error('Error updating preferences:', err);
        res.status(500).json({ error: 'Failed to update preferences' });
      });
  });



  // perfernce route 
  router.patch('/users/:userId/preferences', async (req, res) => {
    const { userId } = req.params;
    const { categories, location, is_vendor } = req.body;
  
    // validation
    if (categories && !Array.isArray(categories)) {
      return res.status(400).json({ error: 'Categories must be an array.' });
    }
  
    if (is_vendor !== undefined && typeof is_vendor !== 'boolean') {
      return res.status(400).json({ error: '`is_vendor` must be a boolean.' });
    }
  
    try {
      // this will find user 
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      // dont really need this 
      await user.update({ location, is_vendor });
  
      // if categories are provided, update them
      if (categories && categories.length > 0) {
        const categoryInstances = await Category.findAll({
          where: { name: categories }
        });
  
        await user.setCategories(categoryInstances);
      }
  
      // refetch full user with categories
      const updatedUser = await User.findByPk(userId, {
         attributes: ['id', 'name', 'email', 'profile_picture', 'location', 'is_vendor'], // add all needed fields
        include: [{ model: Category, through: { attributes: [] } }],
      });
  
      res.status(200).json(updatedUser); // return full user object
    } catch (err) {
      console.error("Error updating preferences:", err);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  });



router.post('/user/me', (req, res) => {
  const user = req.user as User;
  if (!user) return res.status(401).send({ error: 'Not logged in' });

  const { categories, location, is_vendor } = req.body;

  if (categories && !Array.isArray(categories)) {
    return res.status(400).send({ error: 'Categories must be an array.' });
  }

  if (is_vendor !== undefined && typeof is_vendor !== 'boolean') {
    return res.status(400).send({ error: '`is_vendor` must be a boolean.' });
  }

  User.findOne({ where: { email: user.email } })
    .then((existingUser: User | null) => {
      if (existingUser) {
        res.status(200).send({ message: 'User already exists', user: existingUser });
        return;
      }

      return User.create({
        google_id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture ?? null,
        location,
        is_vendor: is_vendor ?? false
      }).then(newUser => {
        if (categories && categories.length > 0) {

          Category.findAll({
            where: {
              name: categories
            }
          }).then((categoryInstances) => {
            newUser.setCategories(categoryInstances);
            res.status(201).send({ message: 'User created', user: newUser });
          });
        } else {
          res.status(201).send({ message: 'User created', user: newUser });
        }
      });
    })
    .catch(err => {
      res.status(500).send({ error: 'Failed to create/find user', details: err });
    });
});

// PATCH
router.patch('/user/me', async (req, res) => {
  const user = req.user as User;
  if (!user) return res.status(401).send({ error: 'Not logged in' });

  const { categories, location, is_vendor } = req.body;

  if (categories && !Array.isArray(categories)) {
    return res.status(400).send({ error: 'Categories must be an array.' });
  }

  if (categories && categories.some((category: string) => !allowedCategories.includes(category))) {
    return res.status(400).send({ error: 'Invalid category value.' });
  }

  if (is_vendor !== undefined && typeof is_vendor !== 'boolean') {
    return res.status(400).send({ error: '`is_vendor` must be a boolean.' });
  }

  try {
    const dbUser = await User.findOne({ where: { email: user.email } });

    if (!dbUser) {
      return res.status(404).send({ error: 'User not found in DB' });
    }

    // location and is_vendor
    await dbUser.update({
      location,
      is_vendor
    });

    // cats
    if (categories) {
      const categoryInstances = await Category.findAll({
        where: {
          name: categories
        }
      });

      // setCat
      await dbUser.setCategories(categoryInstances);

      // fetch
      const updatedCategories = await dbUser.getCategories();

      res.status(200).send({
        message: 'User preferences updated.',
        updated: {
          categories: updatedCategories,
          location: dbUser.location,
          is_vendor: dbUser.is_vendor,
        }
      });
    } else {
      res.status(200).send({
        message: 'User preferences updated.',
        updated: {
          location: dbUser.location,
          is_vendor: dbUser.is_vendor,
        }
      });
    }
  } catch (err) {
    res.status(500).send({ error: 'Failed to update user', details: err });
  }
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



// GET /users/:userId/vendors
router.get("/users/:userId/vendors", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      include: [{ model: Vendor, as: "followedVendors", through: { attributes: [] } }],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.FollowedVendors); // return only vendors
  } catch (err) {
    console.error("Error fetching followed vendors:", err);
    res.status(500).json({ error: "Failed to fetch followed vendors" });
  }
});
// GET all the vendors a user follows
router.get('/users/:userId/followed-vendors', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const followed = await user.getFollowedVendors(); // mixin
    res.status(200).json(followed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get followed vendors' });
  }
});


// follow the vendor 
router.post('/users/:userId/follow/:vendorId', async (req, res) => {
  const { userId, vendorId } = req.params;

  try {
    const user = await User.findByPk(userId);
    const vendor = await Vendor.findByPk(vendorId);

    if (!user || !vendor) {
      return res.status(404).json({ error: 'User or Vendor not found' });
    }

    await user.addFollowedVendor(vendor); // mixin

    res.status(200).json({ message: 'Vendor followed successfully' });
  } catch (err) {
    console.error('Error following vendor:', err);
    res.status(500).json({ error: 'Failed to follow vendor' });
  }
});
// unfollow 
router.post('/users/:userId/unfollow/:vendorId', async (req, res) => {
  const { userId, vendorId } = req.params;
  try {
    const user = await User.findByPk(userId);
    const vendor = await Vendor.findByPk(vendorId);
    if (!user || !vendor) return res.status(404).json({ error: 'User or Vendor not found' });

    await user.removeFollowedVendor(vendor); // mixin
    res.status(200).json({ message: 'Vendor unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unfollow vendor' });
  }
});


// check follow status bih 
router.get('/users/:userId/follows/:vendorId', async (req, res) => {
  const { userId, vendorId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Vendor,
        as: 'followedVendors',
        where: { id: vendorId },
        required: false,
      },
    });

    const isFollowing = user && (user as any).followedVendors && (user as any).followedVendors.length > 0;
    res.status(200).json({ isFollowing }); 
  } catch (err) {
    console.error('Error checking follow status:', err);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});


// bookmark an event
router.post('/users/:userId/bookmark/:eventId', async (req, res) => {
  const { userId, eventId } = req.params;
  try {
    const user = await User.findByPk(userId);
    const event = await Event.findByPk(eventId);
    if (!user || !event) return res.status(404).json({ error: 'Not found' });

    await user.addBookmarkedEvent(event);
    res.status(200).json({ message: 'Event bookmarked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to bookmark event' });
  }
});
export default router;
