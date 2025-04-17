import { Router } from "express";
// import Vendor from "../models/Vendor";
import User from "../models/User";
import Preferences from "../models/Preferences";

const router = Router();

// // Get all vendors
// router.get("/all", async (req, res) => {
//   try {
//     const vendors = await Vendor.findAll();
//     res.status(vendors ? 200 : 404).json(vendors || []);
//   } catch (err) {
//     console.error("Error GETTING all vendor records", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

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

// // Create new vendor
// router.post("/:userId", async (req, res) => {
//   const { userId } = req.params;
//   const vendorObj = req.body;

//   try {
//     const user = await User.findByPk(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     if (user.is_vendor) return res.status(403).json({ error: "User is already a vendor" });

//     vendorObj.userId = userId;
//     const vendor = await Vendor.create(vendorObj);
//     await user.update({ is_vendor: true });
    
//     res.status(201).json(vendor);
//   } catch (err) {
//     console.error("Error POSTING vendor record", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

//TODO: make more efficient by adding only new preferences and deleting only unwanted preferences instead of mass replacement
// Replace old preference records with new ones
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { preferencesArr } = req.body;

  try {
    // make sure given userId is valid
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

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

// // Delete vendor
// router.delete("/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const deletedCount = await Vendor.destroy({ where: { userId } });
//     if (deletedCount) await User.update({ is_vendor: false }, { where: { id: userId } });
//     res.status(deletedCount ? 200 : 404).json({ deletedCount });
//   } catch (err) {
//     console.error("Error DELETING vendor record", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get public vendor profile
// router.get('/public/:vendorId', async (req, res) => {
//   const { vendorId } = req.params;
//   try {
//     const vendor = await Vendor.findByPk(vendorId, {
//       attributes: [
//         'id',
//         'businessName',
//         'description',
//         'profilePicture',
//         'facebook',
//         'instagram',
//         'website',
//         'email'
//       ]
//     });
//     res.status(vendor ? 200 : 404).json(vendor || { error: 'Vendor not found' });
//   } catch (err) {
//     console.error('Error fetching public vendor profile', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

export default router;