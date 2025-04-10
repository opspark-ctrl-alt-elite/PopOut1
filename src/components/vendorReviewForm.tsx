import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Rating } from '@mui/material';

const VendorReviewForm = ({ vendorId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/vendors/${vendorId}/reviews`, {
        rating,
        comment,
      });
      onReviewSubmitted(response.data); // update parent state if needed
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Rating
        name="vendor-rating"
        value={rating}
        onChange={(e, newValue) => setRating(newValue)}
      />
      <TextField
        label="Leave a review"
        multiline
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>
        Submit Review
      </Button>
    </Box>
  );
};

export default VendorReviewForm;
