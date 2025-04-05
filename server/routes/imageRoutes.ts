import multer from "multer";
import cloudinary from "../../cloudinaryConfig";

// type Req = {
//   files: any[];
//   file: any{};
// };

// configure how multer should temporarily store files on the server side
const storage = multer.diskStorage({
  // TODO: delete destination from here and utilize cloudinary
  // destination: function (req, file, cb) {
  //   cb(null, 'public/uploadedImages/vendorImages')
  // },
  filename: function (req, file, cb) {
    // create unique suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // create file name with a fieldname, randomized suffix, and correct original file name
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 20000000 /* measured in bytes */ }
});

import { Router } from "express";
import Image from '../models/Image';

// create router
const imageRouter = Router();

// handle GET requests by finding and returning the image records associated with the given foreign key
imageRouter.get("/:foreignKeyName/:foreignKey", async (req, res) => {
  // extract foreignKeyName and foreignKey from the request parameters
  const { foreignKeyName, foreignKey } = req.params;

  try {
    // find the images associated with the foreign key
    const images = await Image.findAll({ where: { [foreignKeyName]: foreignKey }});
    if (images === null) {
      // if no images were found, set the status code to 404
      res.status(404);
    } else {
      // otherwise, set the status code to 200
      res.status(200);
    }
    // send back the found image records (array)
    res.send(images);

  } catch (err) {
    // generic error handling
    console.error("Error GETTING image records", err);
    res.sendStatus(500);
  }
});

// handle POST requests by using multer to save the given image
imageRouter.post("/:foreignKeyName/:foreignKey", upload.array("imageUpload"), async (req, res) => {

  // extract foreignKeyName and foreignKey from the request parameters
  const { foreignKeyName, foreignKey } = req.params;
  // // extract the image object from the request body
  // const imgObj = req.body;

  try {

    // check if the image upload if for vendor
    if (foreignKeyName === "vendorId") {
      // check if the vendor already has an uploaded image
      const image = await Image.findOne({ where: { [foreignKeyName]: foreignKey }});
      if (image !== null) {
        // send back 403 error if the vendor already has an uploaded image
        console.error("Given vendor already has an associated image record");
        res.status(403).send("Given vendor already has an associated image record");
        // end function early
        return;
      }
    }

    // upload the images to cloudinary (if req.files is an array)
    let imgUploadPromises: any[] = [];
    if (Array.isArray(req.files)) {
      imgUploadPromises = req.files.map(file => {
        return cloudinary.uploader.upload(file.path, {
          resource_type: 'image'
        });
      });
    }

    // wait for the image uploads to complete and return the links
    const uploadResults = await Promise.all(imgUploadPromises);

    // create an array of image objects to bulkCreate image records with
    const imgObjs = uploadResults.map((result: any) => {
      return {
        [foreignKeyName]: foreignKey,
        // use result.url (for http) instead of result.secure_url (for https)
        reference: result.url
      }
    })

    // upload the image to cloudinary
    // const uploadResult = await cloudinary.uploader.upload(req.file.path);

    console.log('body:', req.body);
    console.log('files:', req.files);
    console.log('uploadResults:', uploadResults);
    console.log('imgObjs:', imgObjs);

      // // otherwise, add foreignKey to the imgObj
      // imgObj[foreignKeyName] = foreignKey;


      // create new image records using the Image model
      const images = await Image.bulkCreate(imgObjs);

    res.status(201).send(uploadResults);
  } catch (err) {
    // generic error handling
    console.error("Error uploading and/or POSTING image", err);
    res.status(500).send(err);
  }


  // try {
  //   // check if the vendor already has an uploaded image
  //   const image = await Image.findOne({ where: { [foreignKeyName]: foreignKey }});
  //   if (image !== null) {
  //     // send back 403 error if the vendor already has an uploaded image
  //     console.error("Given vendor already has an associated image record");
  //     res.sendStatus(403);
  //     // ADVISE
  //     // res.status(403).send("Given vendor already has an associated image record");
  //   } else {


  //     // // otherwise, add foreignKey to the imgObj
  //     // imgObj[foreignKeyName] = foreignKey;


  //     // create a new image record using the Image model
  //     const image = await Image.create(imgObj);



  //     // // set the user's "is_vendor" status to true
  //     // await User.update({ is_vendor: true }, { where: { id: foreignKey } });



  //     // send back new image record with status code of 201
  //     res.status(201).send(image);
  //   }

  // } catch (err) {
  //   // generic error handling
  //   console.error("Error POSTING image record for vendor", err);
  //   res.sendStatus(500);
  // }
});

// //TODO:
// // handle POST requests by using multer to save the given images for an event
// imageRouter.post("/event/:foreignKeyName/:foreignKey", upload.array("imageUpload"), async (req, res) => {
//   // extract foreignKeyName and foreignKey from the request parameters
//   const { foreignKeyName, foreignKey } = req.params;
//   // extract the vendor object from the request body
//   const imgObj = req.body;

//   try {
//     // check if the event already has any of the uploaded images
//     const image = await Image.findAll({ where: { [foreignKeyName]: foreignKey }});
//     if (image !== null) {
//       // send back 403 error if the event already has an uploaded image(s)
//       console.error("Given event already has an associated image record(s)");
//       res.sendStatus(403);
//       // ADVISE
//       // res.status(403).send("Given event already has an associated image record(s)");
//     } else {


//       // // otherwise, add foreignKey to the imgObj
//       // imgObj[foreignKeyName] = foreignKey;


//       // create a new image record using the Image model
//       const image = await Image.create(imgObj);



//       // // set the user's "is_vendor" status to true
//       // await User.update({ is_vendor: true }, { where: { id: foreignKey } });



//       // send back new image record with status code of 201
//       res.status(201).send(image);
//     }

//   } catch (err) {
//     // generic error handling
//     console.error("Error POSTING image record for vendor", err);
//     res.sendStatus(500);
//   }
// });

// //TODO:
// // handle PATCH requests by finding and altering the vendor record associated with the given foreignKey
// imageRouter.patch("/:foreignKeyName/:foreignKey", async (req, res) => {
//   // extract foreignKeyName and foreignKey from the request parameters
//   const { foreignKeyName, foreignKey } = req.params;
//   // extract the object containing the fields to change and their new values from the request body
//   const changes = req.body;

//   try {
//     // find and update the vendor associated with foreignKey
//     /*
//       The update method is odd in that instead of returning a record, it simply returns an array
//       containing the number of records found and modified.
//     */
//     const modifiedRecords = await Vendor.update( changes, { where: { foreignKey }});
//     if (modifiedRecords[0] === 0) {
//       // if a vendor wasn't found, set the status code to 404
//       res.status(404);
//     } else {
//       // otherwise, set the status code to 200
//       res.status(200);
//     }
//     // send back the number of modified vendor records (should always be either 0 or 1 in an array) returned from the update method
//     res.send(modifiedRecords);

//   } catch (err) {
//     // generic error handling
//     console.error("Error PATCHING vendor record", err);
//     res.sendStatus(500);
//     // ADVISE: MAY SWITCH TO USING ERROR MESSAGES
//     // res.status(500).send("Error PATCHING vendor record");
//   }
// });

// //TODO:
// // handle DELETE requests by finding and deleting the vendor record associated with the given foreignKey
// imageRouter.delete("/:foreignKeyName/:foreignKey", async (req, res) => {
//   // extract foreignKeyName and foreignKey from the request parameters
//   const { foreignKeyName, foreignKey } = req.params;

//   try {
//     // find the vendor associated with foreignKey
//     /*
//       The destroy method is odd in that instead of returning a record, it simply returns a
//       number of records found and deleted.
//     */
//     const deletedRecords = await Vendor.destroy({ where: { foreignKey }});
//     if (deletedRecords === 0) {
//       // if a vendor wasn't found, send a status code of 404
//       res.sendStatus(404);
//     } else {
//       // otherwise, update the associated user record to make the user's "is_vendor" status false
//       await User.update({ is_vendor: false }, { where: { id: foreignKey } });
//       // send a status code of 200
//       res.sendStatus(200);
//     }

//   } catch (err) {
//     // generic error handling
//     console.error("Error DELETING vendor record", err);
//     res.sendStatus(500);
//   }
// });

export default imageRouter;