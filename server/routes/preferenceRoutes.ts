import { Router } from "express";
// import Vendor from "../models/Vendor";
import User from "../models/User";
import Preferences from "../models/Preferences";
import Category from "../models/Category";
import { UUID } from "crypto";

const router = Router();

// Get preferences by userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // obtain preferences from db
    const preferences = await Preferences.findAll({ where: { userId } });
    res.status(preferences ? 200 : 404).json(preferences || { error: "preferences not found" });
  } catch (err) {
    console.error("Error GETTING preference records for current user", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//TODO: MAYBE make more efficient by adding only new preferences and deleting only unwanted preferences instead of mass replacement
// Replace old preference records with new ones
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  // take out array of category names from request body
  const { categoryNames } = req.body;

  try {
    // make sure given userId is valid
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // retrieve each category associated with each category name
    let cats = categoryNames.map((name: string) => Category.findOne({ where: { name }}));

    // wait for the categories to resolve before continuing
    cats = await Promise.all(cats);

    // create empty array to hold the new preferences
    const preferencesArr: { userId: string; categoryId: any }[] = [];

    // fill preferencesArr by looping through the given categories and
    // creating a new preference object using the given user id and the id associated with each category name
    cats.forEach((cat: { dataValues: { id: number, name: string }}) => {
      preferencesArr.push({
        userId,
        categoryId: cat.dataValues.id
      })
    });

    // // obtain preferences from db
    // const preferences = await Preferences.findAll({ where: { userId } });

    // // get the categoryId out of each preference
    // const prefCatIds = preferences.map(preference => preference.dataValues.categoryId);

    // delete the user's current preferences from the preferences db
    await Preferences.destroy({ where: { userId } });

    // create new preferences for the user using the given array of preference objects
    const newPreferences = await Preferences.bulkCreate(preferencesArr);

    res.status(200).json({ newPreferences });
  } catch (err) {
    console.error("Error PATCHING vendor record", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;