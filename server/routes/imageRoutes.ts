import multer from "multer";
import cloudinary from "../../cloudinaryConfig";
import { Router } from "express";
import Image from '../models/Image';
import { Op } from "sequelize";

type WhereFilter = {
  userId?: string | null;
  vendorId?: string | null;
  eventId?: string | null;
}

// configure how multer should temporarily store files on the server side
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    // create unique suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // create file name with a fieldname, randomized suffix, and correct original file name
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 /* measured in bytes (5MB) */ }
});

// export async function createImageUpload() {
//   const timestamp = new Date().getTime()
//   const signature = await cloudinary.utils.api_sign_request(
//     {
//       timestamp,
//     },
//     process.env.CLOUDINARY_API_SECRET
//   )
//   return { timestamp, signature }
// }

// create router
const imageRouter = Router();

// handle GET requests by finding and returning the image records associated with the given foreign key
imageRouter.get("/:foreignKeyName/:foreignKey", async (req, res) => {
  // extract foreignKeyName and foreignKey from the request parameters
  const { foreignKeyName, foreignKey } = req.params;

  // set up the object used to filter through the Image database table
  const whereFilter: WhereFilter = { [foreignKeyName]: foreignKey };

  // // add null for the other ids to prevent getting images belonging to vendors and/or events that themselves belong to the user and/or vendor associated with the foreignKey
  // if (foreignKeyName === "userId") {
  //   whereFilter.vendorId = null;
  //   whereFilter.eventId = null;
  // } else if (foreignKeyName === "vendorId") {
  //   whereFilter.eventId = null;
  // }

  try {
    // find the images associated with the foreign key
    const images = await Image.findAll({ where: whereFilter});
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
imageRouter.post("/:foreignKeyName/:foreignKey", upload.array("file"), async (req, res) => {

  // extract foreignKeyName and foreignKey from the request parameters
  const { foreignKeyName, foreignKey } = req.params;

  console.log(req);
  console.log(req.files);

  try {

    // check if the image upload is for vendor
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

    console.log(uploadResults)

    // create an array of image objects to bulkCreate image records with
    const imgObjs = uploadResults.map((result: any) => {
      return {
        publicId: result.public_id,
        // use result.url (for http) instead of result.secure_url (for https)
        referenceURL: result.url,
        [foreignKeyName]: foreignKey,
      }
    })

    // create new image records using the Image model
    await Image.bulkCreate(imgObjs);

    res.status(201).send(uploadResults);
  } catch (err) {
    // generic error handling
    console.error("Error uploading and/or POSTING image", err);
    res.status(500).send(err);
  }
});

// handle PATCH requests by using multer to temporarily hold the given image(s) before using said image(s) to replace old ones (by public id) in both the cloud and the images db
// HAS TO BE POST DUE TO LIMITATIONS OF HTML FORMS
imageRouter.post("/:publicIds", upload.array("file"), async (req, res) => {

  // extract publicIds from the request parameters
  const { publicIds } = req.params;

  // turn publicIds back into an array of public ids
  const parsedPublicIds: string[] = publicIds.split("-");

  try {

    // upload the replacement images to cloudinary (if req.files is an array)
    let imgUploadPromises: any[] = [];
    if (Array.isArray(req.files)) {
      imgUploadPromises = req.files.map((file, index) => {
        return cloudinary.uploader.upload(file.path, {
          resource_type: 'image',
          public_id: parsedPublicIds[index]
        });
      });
    }

    // wait for the image uploads to complete and return the links
    const uploadResults = await Promise.all(imgUploadPromises);

    // create an array of image objects/modifications to modify image records with
    const imagesMods = uploadResults.map((result: any) => {
      return {
        publicId: result.public_id,
        // use result.url (for http) instead of result.secure_url (for https)
        referenceURL: result.url,
      }
    })

    // find the images associated with the public ids
    let images = await Image.findAll({ where: { publicId: parsedPublicIds }});

    // get the data out of each image
    images = images.map(image => image.dataValues);

    // modify the obtained image records with the new urls
    const moddedImages = images.map((image: any) => {
      imagesMods.forEach((mod: any) => {
        if (image.publicId === mod.publicId) {
          image.referenceURL = mod.referenceURL;
        }
      })
      return image;
    })

    // replace the image records using the moddedImages and Image model
    for (let newRec of moddedImages) {
      await Image.update( newRec, { where: { id: newRec.id }});
    }

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

  try {
    // delete the images from the cloudinary asset storage
    let deletedCloudImages = await cloudinary.api.delete_resources(publicIds);

    // delete the corresponding images from the images db
    const deletedRecords = await Image.destroy({
      where: {
        publicId: {
          [Op.in]: publicIds
        }
      }
    });
    
    if (deletedRecords === 0 && deletedCloudImages.deleted[''] === 'not_found') {
      // if an image wasn't found anywhere, send a status code of 404 with message
      res.status(404).send("no Images were found in or deleted from the cloud nor db");
    } else if (deletedRecords === 0) {
      // if an image wasn't found in the db, send a status code of 404 with message
      res.status(200).send("Images found and deleted from the cloud, but not the db");
    } else if (deletedCloudImages.deleted[''] === 'not_found') {
      // return 404 error wih message if no images were found in the cloud
      res.status(200).send("Images found and deleted from the db, but not the cloud");
    } else {
      // send a status code of 200 with message
      res.status(200).send("Images successfully deleted from cloud and database");
    }

  } catch (err) {
    // generic error handling
    console.error("Error DELETING image", err);
    res.status(500).send(err);
  }
});

export default imageRouter;