import Image from '../models/Image';
// import multer from "multer";
// const upload = multer({ dest: '../../public/uploadedImages/' });
import { promises as fsP } from "node:fs";

// this is the only synchronous image helper function
const postAndPatchImageChecker = ( inputImage?: any ) => {
  // check if the given profile image is an uploaded image(s) instead of an url
  if (inputImage !== null && typeof inputImage === "object") {
    // if so, return a string of "uploaded" to indicate that it is an uploaded image (said string will be put into associated vendor record as its "profilePicture")
    return "uploaded";
  } else {
    // otherwise, return the original inputImage;
    return inputImage;
  }
};

const postAndPatchImageHandler = async ( targetFolder: string, inputImage?: any ) => {
  try {
    console.log(inputImage);
    // Loop through each image
    for (let i = 0; i < inputImage.length; i++) {
      // write each file to the appropriate target folder using Node's file system
      // create a new image record in the images db
    }
    // return a string of "uploaded" to indicate that it is an uploaded image (said string will be put into associated vendor record as its "profilePicture")
    return "uploaded";
  } catch (err) {
    // generic error handling
    console.error("Error with handling image", err);
  }
};

export default {
  postAndPatchImageChecker,
  postAndPatchImageHandler,

};