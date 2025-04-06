import multer from "multer";
import cloudinary from "../../cloudinaryConfig";
import { Router } from "express";
import Image from '../models/Image';
import { Op } from "sequelize";

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

// handle POST requests by using multer to temporarily hold the given image(s) before posting said image(s) to both the cloud and the images db
imageRouter.post("/:foreignKeyName/:foreignKey", upload.array("imageUpload"), async (req, res) => {

  // extract foreignKeyName and foreignKey from the request parameters
  const { foreignKeyName, foreignKey } = req.params;

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
        publicId: result.public_id,
        // use result.url (for http) instead of result.secure_url (for https)
        referenceURL: result.url,
        [foreignKeyName]: foreignKey,
      }
    })

    // upload the image to cloudinary
    // const uploadResult = await cloudinary.uploader.upload(req.file.path);

    console.log('body:', req.body);
    console.log('files:', req.files);
    console.log('uploadResults:', uploadResults);
    console.log('imgObjs:', imgObjs);

    // create new image records using the Image model
    await Image.bulkCreate(imgObjs);

    res.status(201).send(uploadResults);
  } catch (err) {
    // generic error handling
    console.error("Error uploading and/or POSTING image", err);
    res.status(500).send(err);
  }
});

//imageRouter.patch
// handle PATCH requests by using multer to temporarily hold the given image(s) before using said image(s) to replace old ones (by public id) in both the cloud and the images db
imageRouter.patch("/:foreignKeyName/:foreignKey", upload.array("imageUpload"), async (req, res) => {

  // extract foreignKeyName and foreignKey from the request parameters
  //const { foreignKeyName, foreignKey } = req.params;

   // extract the array of publicIds that correspond to the images that will be replaced
   const { publicIds } = req.body;

  try {

    // // check if the image upload if for vendor
    // if (foreignKeyName === "vendorId") {
    //   // check if the vendor already has an uploaded image
    //   const image = await Image.findOne({ where: { [foreignKeyName]: foreignKey }});
    //   if (image !== null) {
    //     // send back 403 error if the vendor already has an uploaded image
    //     console.error("Given vendor already has an associated image record");
    //     res.status(403).send("Given vendor already has an associated image record");
    //     // end function early
    //     return;
    //   }
    // }

    // upload the replacement images to cloudinary (if req.files is an array)
    let imgUploadPromises: any[] = [];
    if (Array.isArray(req.files)) {
      imgUploadPromises = req.files.map((file, index) => {
        return cloudinary.uploader.upload(file.path, {
          resource_type: 'image',
          public_id: publicIds[index]
        });
      });
    }

    // wait for the image uploads to complete and return the links
    const uploadResults = await Promise.all(imgUploadPromises);

    // create an array of image objects to bulkCreate (replace) image records with
    const imgObjs = uploadResults.map((result: any) => {
      return {
        publicId: result.public_id,
        // use result.url (for http) instead of result.secure_url (for https)
        referenceURL: result.url,
      }
    })

    // upload the image to cloudinary
    // const uploadResult = await cloudinary.uploader.upload(req.file.path);

    console.log('body:', req.body);
    console.log('files:', req.files);
    console.log('uploadResults:', uploadResults);
    console.log('imgObjs:', imgObjs);

    // replace the image records using the Image model
    await Image.bulkCreate(imgObjs, {
      updateOnDuplicate: ['publicId']
    });

    res.status(201).send(uploadResults);
  } catch (err) {
    // generic error handling
    console.error("Error uploading and/or POSTING image", err);
    res.status(500).send(err);
  }
});

// handle delete requests by deleting images from both cloudinary and the images database
imageRouter.delete("/", async (req, res) => {
  // extract the array of publicIds that correspond to the images that will be deleted
  const { publicIds } = req.body;

  console.log(req.body);
  console.log(publicIds);

  try {
    // delete the images from the cloudinary asset storage
    let deletedCloudImages = await cloudinary.api.delete_resources(publicIds);
    console.log(deletedCloudImages);

    if (deletedCloudImages.deleted[''] === 'not_found') {
      // return 404 error wih message if no images were found in the cloud
      res.status(404).send("no Images were found in or deleted from the cloud");
    } else {
      // otherwise, delete the corresponding images from the images db
      const deletedRecords = await Image.destroy({
        where: {
          publicId: {
            [Op.in]: publicIds
          }
        }
      });
      if (deletedRecords === 0) {
        // if an image wasn't found, send a status code of 404 with message
        res.status(404).send("no Images were found in or deleted from the db");
      } else {
        // // otherwise, update the associated user record to make the user's "is_vendor" status false
        // await User.update({ is_vendor: false }, { where: { id: foreignKey } });
        // send a status code of 200 with message
        res.status(200).send("Images successfully deleted from cloud and database");
      }
    }

  } catch (err) {
    // generic error handling
    console.error("Error DELETING image", err);
    res.status(500).send(err);
  }
});

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