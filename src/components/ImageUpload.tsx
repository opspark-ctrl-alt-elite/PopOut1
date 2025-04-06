import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import { Button, Box } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

type Props = {
//  inputData: object;
  foreignKeyName: string;
  foreignKey: string;
  multi: boolean;
  getImages: Function;
};

// image upload component used for uploading images to the cloud and the image link to the db

// foreignKeyName: the name of the foreign key in the images db to modify for the record currently being made
// foreignKey: the value to set the foreignKeyName to within the record
// multi: determines whether or not multiple files are allowed to be uploaded
// getImages: function passed in from parent component that gets the uploaded image(s) from the db and updates the state with said image(s)
const ImageUpload: React.FC<Props> = ({ foreignKeyName, foreignKey, multi = true, getImages }) => {

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
<Box>
  <iframe name="dummyframe" id="dummyframe" style={{display: 'none'}}></iframe>
  <form action={`/api/images/${foreignKeyName}/${foreignKey}`} target="dummyframe" method="post" encType="multipart/form-data">
    <p>max size is 20mb</p>
    <input type="file" name="imageUpload" accept="image/*"/>
    <button type="submit">Submit (new upload)</button>
  </form>
  {/* <form action={`/api/images/${foreignKeyName}/${foreignKey}`} target="dummyframe" method="patch" encType="multipart/form-data">
    <p>max size is 20mb</p>
    <input type="file" name="imageUpload" accept="image/*"/>
    <button type="submit">Submit (replace upload)</button>
  </form> */}
</Box>
  );
};

export default ImageUpload;