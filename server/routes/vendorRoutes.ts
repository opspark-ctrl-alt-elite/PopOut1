import { Router } from "express";
import Vendor from "../models/Vendor";
import User from "../models/User";

// create router
const router = Router();

// handle GET requests by finding and returning the vendor record associated with the given userId
router.get("/:userId", async (req, res) => {
  // extract userId from the request parameters
  const { userId } = req.params;

  try {
    // find the vendor associated with userId
    const vendor = await Vendor.findOne({ where: { userId }});
    if (vendor === null) {
      // if a vendor wasn't found, set the status code to 404
      res.status(404);
    } else {
      // otherwise, set the status code to 200
      res.status(200);
    }
    // send back the found vendor record (object)
    res.send(vendor);

  } catch (err) {
    // generic error handling
    console.error("Error GETTING vendor record", err);
    res.sendStatus(500);
  }
});

// handle POST requests by using the given vendor object to create a new vendor record
router.post("/:userId", async (req, res) => {
  // extract userId from the request parameters
  const { userId } = req.params;
  // extract the vendor object from the request body
  const vendorObj = req.body;

  try {
    // check if the user exists
    const user = await User.findOne({ where: { id: userId } });
    if (user === null) {
      // send back 404 error if the user cannot be found
      console.error("Could not find vendor record for given user");
      res.sendStatus(404);
    } else {
      // otherwise, add userId to the vendorObj
      vendorObj.userId = userId;
      // create a new vendor record using the Vendor model
      const vendor = await Vendor.create(vendorObj);
      // send back new vendor record with status code of 201
      res.status(201).send(vendor);
    }

  } catch (err) {
    // generic error handling
    console.error("Error POSTING vendor record", err);
    res.sendStatus(500);
  }
});

// handle PATCH requests by finding and altering the vendor record associated with the given userId
router.patch("/:userId", async (req, res) => {
  // extract userId from the request parameters
  const { userId } = req.params;
  // extract the object containing the fields to change and their new values from the request body
  const changes = req.body;

  try {
    // find and update the vendor associated with userId
    const vendor = await Vendor.update( changes, { where: { userId }});
    if (vendor === null) {
      // if a vendor wasn't found, set the status code to 404
      res.status(404);
    } else {
      // otherwise, set the status code to 200
      res.status(200);
    }
    // send back the old vendor record (object) returned from the update method
    res.send(vendor);

  } catch (err) {
    // generic error handling
    console.error("Error PATCHING vendor record", err);
    res.sendStatus(500);
  }
});

// handle DELETE requests by finding and deleting the vendor record associated with the given userId
router.delete("/:userId", async (req, res) => {
  // extract userId from the request parameters
  const { userId } = req.params;

  try {
    // find the vendor associated with userId
    const vendor = await Vendor.destroy({ where: { userId }});
    if (vendor === null) {
      // if a vendor wasn't found, set the status code to 404
      res.status(404);
    } else {
      // otherwise, set the status code to 200
      res.status(200);
    }
    // send back the deleted vendor record (object)
    res.send(vendor);
    
  } catch (err) {
    // generic error handling
    console.error("Error DELETING vendor record", err);
    res.sendStatus(500);
  }
});

export default router;