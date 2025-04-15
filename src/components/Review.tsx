import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';

interface Review {
  id?: string;
  rating: number;
  comment: string;
  userId?: string;
  vendorId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ReviewComponentProps {
  vendorId: string;
  currentUserId: string;
  onReviewAdded?: () => void;
  onReviewUpdated?: () => void;
  onReviewDeleted?: () => void;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({
  vendorId,
  currentUserId,
  onReviewAdded,
  onReviewUpdated,
  onReviewDeleted,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/vendors/${vendorId}/reviews`);
      const reviewsArray = Array.isArray(response.data) ? response.data : 
                         (response.data?.reviews ? response.data.reviews : []);
      
      setReviews(reviewsArray);
      const existingReview = reviewsArray.find(
        (review) => review.userId === currentUserId
      ) || null;
      
      setUserReview(existingReview);
      if (existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      } else {
        setRating(0);
        setComment('');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to fetch reviews. Please try again later.');
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchReviews();
    }
  }, [vendorId, currentUserId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!rating) {
      setError('Please provide a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (userReview?.id) {
        // Update existing review
        await axios.put(
          `/vendors/${vendorId}/reviews/${userReview.id}`,
          { rating, comment }
        );
        if (onReviewUpdated) onReviewUpdated();
      } else {
        // Create new review
        await axios.post(
          `/vendors/${vendorId}/reviews`,
          { rating, comment }
        );
        if (onReviewAdded) onReviewAdded();
      }
      await fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userReview?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`/vendors/${vendorId}/reviews/${userReview.id}`);
      if (onReviewDeleted) onReviewDeleted();
      await fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {userReview ? 'Update Your Review' : 'Add Your Review'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              precision={0.5}
            />
          </Box>
          
          <TextField
            label="Comment (optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || rating === 0}
            >
              {loading ? <CircularProgress size={24} /> : 
               userReview ? 'Update Review' : 'Submit Review'}
            </Button>
            
            {userReview && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Review
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        All Reviews
      </Typography>
      
      {reviews.length === 0 ? (
        <Typography>No reviews yet</Typography>
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Box key={review.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={review.rating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </Typography>
              </Stack>
              {review.comment && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {review.comment}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ReviewComponent;