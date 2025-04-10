import { Router } from "express";
import Vendor from "../models/Vendor";
import User from "../models/User";
import axios from "axios";

// create router
const vendorRouter = Router();

// handle GET requests for all vendors by returning all vendor records
vendorRouter.get("/all", async (req, res) => {
  try {
    // retrieve all vendor records from the vendors table
    const vendors = await Vendor.findAll({});
    if (vendors === null) {
      // if no vendors were found, set the status code to 404
      res.status(404);
    } else {
      // otherwise, set the status code to 200
      res.status(200);
    }
    // send back the found vendor records (array of objects)
    res.send(vendors);

  } catch (err) {
    // generic error handling
    console.error("Error GETTING all vendor records", err);
    res.sendStatus(500);
  }
});

// handle GET requests by finding and returning the vendor record associated with the given userId
vendorRouter.get("/:userId", async (req, res) => {
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
vendorRouter.post("/:userId", async (req, res) => {
  // extract userId from the request parameters
  const { userId } = req.params;
  // extract the vendor object from the request body
  const vendorObj = req.body;

  try {
    // check if the user exists (and if the user is NOT already a vendor)
    const user = await User.findOne({ where: { id: userId } });
    if (user === null) {
      // send back 404 error if the user cannot be found
      console.error("Could not find vendor record for given user");
      res.sendStatus(404);
      // ADVISE
      // res.status(404).send("Could not find vendor record for given user");
    }
    /* While this "else if" block is technically unneeded, it does allow the sending back of the 403 status code */
    else if (user.is_vendor === true) {
      // send back 403 error if the user already has a vendor
      console.error("Given user already has an associated vendor record");
      res.sendStatus(403);
      // ADVISE
      // res.status(403).send("Given user already has an associated vendor record");
    } else {
      // otherwise, add userId to the vendorObj
      vendorObj.userId = userId;

      // use the image helper function for handling post and patch requests that may contain uploaded images
      /////vendorObj.profilePicture = imageHelperFuncs.postAndPatchImageChecker(vendorObj.profilePicture);


      // // check if the given profile image is an uploaded image instead of an url
      // if (vendorObj.profilePicture !== null && typeof vendorObj.profilePicture === "object") {
      //   // set vendorObj.profilePicture to a string of "uploaded" to indicate that it is an uploaded image
      //   vendorObj.profilePicture = "uploaded";
      // }



      // create a new vendor record using the Vendor model
      const vendor = await Vendor.create(vendorObj);
      // set the user's "is_vendor" status to true
      await User.update({ is_vendor: true }, { where: { id: userId } });
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
vendorRouter.patch("/:userId", async (req, res) => {
  // extract userId from the request parameters
  const { userId } = req.params;
  // extract the object containing the fields to change and their new values from the request body
  const changes = req.body;

  try {
    // find and update the vendor associated with userId
    /*
      The update method is odd in that instead of returning a record, it simply returns an array
      containing the number of records found and modified.
    */
    const modifiedRecords = await Vendor.update( changes, { where: { userId }});
    if (modifiedRecords[0] === 0) {
      // if a vendor wasn't found, set the status code to 404
      res.status(404);
    } else {
      // otherwise, set the status code to 200
      res.status(200);
    }
    // send back the number of modified vendor records (should always be either 0 or 1 in an array) returned from the update method
    res.send(modifiedRecords);

  } catch (err) {
    // generic error handling
    console.error("Error PATCHING vendor record", err);
    res.sendStatus(500);
    // ADVISE: MAY SWITCH TO USING ERROR MESSAGES
    // res.status(500).send("Error PATCHING vendor record");
  }
});

// handle DELETE requests by finding and deleting the vendor record associated with the given userId
vendorRouter.delete("/:userId", async (req, res) => {
  // extract userId from the request parameters
  const { userId } = req.params;

  try {
    // find the vendor associated with userId
    /*
      The destroy method is odd in that instead of returning a record, it simply returns a
      number of records found and deleted.
    */
    const deletedRecords = await Vendor.destroy({ where: { userId }});
    if (deletedRecords === 0) {
      // if a vendor wasn't found, send a status code of 404
      res.sendStatus(404);
    } else {
      // otherwise, update the associated user record to make the user's "is_vendor" status false
      await User.update({ is_vendor: false }, { where: { id: userId } });
      // send a status code of 200
      res.sendStatus(200);
    }

  } catch (err) {
    // generic error handling
    console.error("Error DELETING vendor record", err);
    res.sendStatus(500);
  }
});

// GET pubic vendor profile
vendorRouter.get('/public/:vendorId', async (req, res) => {
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
        'website'
      ]
    });
    if (!vendor) return res.status(404).json({ error: 'vendor not found' });
    res.status(200).json(vendor);
  } catch (err) {
    console.error('err fetching public vendor profile', err);
    res.status(500);
  }
});

export default vendorRouter;