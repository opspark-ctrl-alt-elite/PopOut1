import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Button, Box } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

type Props = {
//  inputData: object;
  foreignKeyName: string;
  foreignKey: string;
  multi: boolean;
  getImages: Function;
  publicIds: any[];
  // images: any[];
};

// image upload component used for uploading images to the cloud and the image link to the db

// foreignKeyName: the name of the foreign key in the images db to modify for the record currently being made
// foreignKey: the value to set the foreignKeyName to within the record
// multi: determines whether or not multiple files are allowed to be uploaded
// getImages: function passed in from parent component that gets the uploaded image(s) from the db and updates the state with said image(s)
// publicIds: array of the public ids of uploaded images from the state of parent component that will be used in path requests
const ImageUpload: React.FC<Props> = ({ foreignKeyName, foreignKey, multi = true, getImages, publicIds }) => {

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

  // // create array of public ids
  // let publicIds = images.map(image => image ? image.publicId : null);
  // every time this component ios rendered, turn the array of public ids into a string of public ids separate by "-"
  const publicIdsString = publicIds.join("-");

  ///////////// keep running getImages on an interval until the result is different
  const runImageGetter = () => {
    // // create a reference by using the updatedAt property of one of the images
    // let currTime = images[0] ? images[0].updatedAt : null;
    // let interval = setInterval(() => {
    //   getImages();
    //   if (currTime === images[0] ? images[0].updatedAt : null) {
    //     clearInterval(interval);
    //   }
    // }, 2000);

    // just give 5 seconds to give time for updating cloud before getting image
    setTimeout(getImages, 5000);
  }

  // sends a post request
  /*
  handleSubmit(e)
{
  e.preventDefault();
  const err = this.validate();
  if (!err) {
    var formData = {
      category: this.state.category,
      course: this.state.course,
    };
    const { category, course } = this.state;
    let fd = new FormData();
    fd.append('Test', this.state.testFile, this.state.testFile.name);
    fd.append('category', category);
    fd.append('course', course);
    console.log(fd);
    axios({
      method: 'post',
      url: 'http://localhost:7777/api/uploadTest',
      data: fd,
    })
      .then((response) => {
        if (response.data == 'Success') {
          alert('Test has been Added..!!');
        }
        else {
          alert('Something went wrong');
          this.setState({ category: '' });
        }
        // this.setState({success:'Alert: '+response.data});
      })
      .catch((e) => {
        console.error(e);
        this.setState({ success: 'Alert: Something went wrong' });
      });
  }
}






















<form id="uploadForm" enctype="multipart/form-data">
  <input type="file" name="avatar" id="avatar" />
  <button type="submit">Upload</button>
</form>






document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission

  const formData = new FormData();
  const fileInput = document.getElementById('avatar');
  
  if (fileInput.files.length > 0) {
    formData.append('avatar', fileInput.files[0]);
  }

  axios.post('/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => {
    console.log('File uploaded successfully:', response.data);
  })
  .catch(error => {
    console.error('Error uploading file:', error);
  });
});


  */

  return (
<Box>
  <iframe name="dummyframe" id="dummyframe" style={{display: 'none'}}></iframe>
  <form onSubmit={runImageGetter} action={`/api/images/${foreignKeyName}/${foreignKey}`} target="dummyframe" method="post" encType="multipart/form-data">
    <p>max size is 20mb</p>
    <input type="file" name="file" accept="image/*" multiple={multi}/>
    <button type="submit">Submit (new upload)</button>
  </form>
  <form onSubmit={runImageGetter} action={`/api/images/${publicIdsString}`} target="dummyframe" method="post" encType="multipart/form-data">
    <p>max size is 20mb</p>
    <input type="file" name="file" accept="image/*" multiple={multi}/>
    <button type="submit">Submit (replace upload)</button>
  </form>
</Box>
  );
};

export default ImageUpload;