import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

type Props = {
//  inputData: object;
  foreignKeyName: string;
  foreignKey: string;
  multi: boolean;
};

// image upload component used for uploading images to the db
const ImageUpload: React.FC<Props> = ({ foreignKeyName, foreignKey, multi = true }) => {

  // create a component for a hidden input field
  const HiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  return (
    // <Button
    //   component="form"
    //   action={`/api/images/vendor/${foreignKeyName}/${foreignKey}`}
    //   method="post"
    //   encType="multipart/form-data"
    //   role={undefined}
    //   variant="contained"
    //   tabIndex={-1}
    //   startIcon={<CloudUpload />}
    // >
    //   Upload Image(s)
    //   <HiddenInput
    //     type="file"
    //     // name is new TODO:
    //     name="imageUpload"
    //     // onChange={
    //     //   (event) => {
    //     //     setInputData((prev: any) => {
    //     //       prev[imageKeyName] = event.currentTarget.files;
    //     //       return prev;
    //     //     })
    //     //     console.log(event.currentTarget.files);
    //     //   }
    //     // }
    //     multiple={multi}
    //   />
    // </Button>

    <form action={`/api/images/vendor/${foreignKeyName}/${foreignKey}`} method="post" encType="multipart/form-data">
      <input type="file" name="imageUpload" accept="image/*"/>
      <button type="submit">Submit</button>
    </form>
  );
};

export default ImageUpload;