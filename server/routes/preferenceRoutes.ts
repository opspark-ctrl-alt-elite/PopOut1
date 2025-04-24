import { Router } from "express";
import User from "../models/User";
import Preferences from "../models/Preferences";
import Category from "../models/Category";

const router = Router();

// Get preferences by userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const preferences = await Preferences.findAll({ where: { userId } });
    res.status(preferences ? 200 : 404).json(preferences || { error: "Preferences not found" });
  } catch (err) {
    console.error("Error GETTING preference records for user", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { categoryNames } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // retrieve each category associated with each category name
    let cats = categoryNames.map((name: string) => Category.findOne({ where: { name }}));

    // wait for the categories to resolve before continuing
    cats = await Promise.all(cats);
    if (!cats) return res.status(404).json({ error: "Categories not found" });

    // Filter out any null values 
    const validCategories = categories.filter((c): c is Category => !!c);

    // Delete old preferences
    await Preferences.destroy({ where: { userId } });

    // Create new ones
    const newPrefs = validCategories.map((cat) => ({
      userId,
      categoryId: cat.id,
    }));

    await Preferences.bulkCreate(newPrefs);

    const updatedUser = await User.findByPk(userId, {
      include: [Category],
    });

    res.status(200).json({ updated: updatedUser });
  } catch (err) {
    console.error("Error PUT /preferences", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;