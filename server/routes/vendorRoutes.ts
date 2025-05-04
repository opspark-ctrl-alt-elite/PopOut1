import { Router } from "express";
import Vendor from "../models/Vendor";
import User from "../models/User";

const router = Router();

// Get all vendors
router.get("/all", async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.status(vendors ? 200 : 404).json(vendors || []);
  } catch (err) {
    console.error("Error GETTING all vendor records", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get vendor by userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const vendor = await Vendor.findOne({ where: { userId } });
    res.status(vendor ? 200 : 404).json(vendor || { error: "Vendor not found" });
  } catch (err) {
    console.error("Error GETTING vendor record", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new vendor
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const vendorObj = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.is_vendor) return res.status(403).json({ error: "User is already a vendor" });

    vendorObj.userId = userId;
    const vendor = await Vendor.create(vendorObj);
    await user.update({ is_vendor: true });
    
    res.status(201).json(vendor);
  } catch (err) {
    console.error("Error POSTING vendor record", err);
    res.status(500).json({ error: "Internal server error", message: err });
  }
});

// Update vendor
router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const changes = req.body;

  try {
    const [affectedCount] = await Vendor.update(changes, { where: { userId } });
    res.status(affectedCount ? 200 : 404).json({ affectedCount, message: (affectedCount ? "Vendor profile updated" : "The given fields could not be located in the database, so no changes were made") });
  } catch (err) {
    console.error("Error PATCHING vendor record", err);
    res.status(500).json({ error: "Internal server error", message: err });
  }
});

// Delete vendor
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedCount = await Vendor.destroy({ where: { userId } });
    if (deletedCount) await User.update({ is_vendor: false }, { where: { id: userId } });
    res.status(deletedCount ? 200 : 404).json({ deletedCount });
  } catch (err) {
    console.error("Error DELETING vendor record", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get public vendor profile
router.get('/public/:vendorId', async (req, res) => {
  const { vendorId } = req.params;
  try {
    const vendor = await Vendor.findByPk(vendorId, {
      attributes: [
        'id',
        'businessName',
        'description',
        'profilePicture',
        'facebook',
        'instagram',
        'website',
        'email'
      ]
    });
    res.status(vendor ? 200 : 404).json(vendor || { error: 'Vendor not found' });
  } catch (err) {
    console.error('Error fetching public vendor profile', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;