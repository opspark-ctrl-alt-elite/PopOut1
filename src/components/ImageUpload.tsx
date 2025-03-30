import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

type Props = {
  inputData: object;
  setInputData: Function;
  imageKeyName: string;
};

// image upload component used for uploading images to the db
const ImageUpload: React.FC<Props> = ({ inputData, setInputData, imageKeyName }) => {

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
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUpload />}
    >
      Upload Files
      {imageKeyName === "profilePicture" ? (
        <HiddenInput
          type="file"
          onChange={(event) => console.log(event.target.files)}
        />
      ) : (
        <HiddenInput
          type="file"
          onChange={(event) => console.log(event.target.files)}
          multiple
        />
      )}
    </Button>
  );
};

export default ImageUpload;