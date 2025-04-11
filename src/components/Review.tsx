// ReviewComponent.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Rating from '@mui/material/Rating';

// Define the Review type based on the API response structure.
export interface Review {
  id?: string;
  rating: number;
  comment: string;
  userId?: string;
  vendorId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Component props include vendorId and currentUserId to control per-user rating.
interface ReviewComponentProps {
  vendorId: string;
  currentUserId: string;
  initialReviews?: Review[];
  onReviewAdded?: (review: Review) => void;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({
  vendorId,
  currentUserId,
  initialReviews = [],
  onReviewAdded,
}) => {
  // Local state for reviews, current user's review, form inputs, loading and error handling.
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews from the API and update local state.
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/vendors/${vendorId}/reviews`);

      // Ensure we work with an array.
      let reviewsArray: Review[] = [];
      if (Array.isArray(response.data)) {
        reviewsArray = response.data;
      } else if (response.data && Array.isArray(response.data.reviews)) {
        reviewsArray = response.data.reviews;
      }
      
      // Optionally, if you want to filter out test reviews, for example, those having a specific comment:
      // reviewsArray = reviewsArray.filter(r => r.comment !== 'Test comment');

      setReviews(reviewsArray);

      // Determine if the current user already has a review.
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
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to fetch reviews. Please try again later.');
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchReviews();
    }
  }, [vendorId]);

  // Handle form submission: Create a new review or update the existing one.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { rating, comment };

    try {
      if (userReview && userReview.id) {
        // Update existing review via PUT.
        const response = await axios.put(
          `/vendors/${vendorId}/reviews/${userReview.id}`,
          payload
        );
        const updatedReview: Review = response.data;
        setUserReview(updatedReview);
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === updatedReview.id ? updatedReview : review
          )
        );
        if (onReviewAdded) {
          onReviewAdded(updatedReview);
        }
      } else {
        // Create new review via POST.
        const response = await axios.post(
          `/vendors/${vendorId}/reviews`,
          payload
        );
        const newReview: Review = response.data;
        setUserReview(newReview);
        setReviews((prevReviews) => [newReview, ...prevReviews]);
        if (onReviewAdded) {
          onReviewAdded(newReview);
        }
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete action for the current user's review.
  const handleDelete = async () => {
    if (!userReview || !userReview.id) return;
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`/vendors/${vendorId}/reviews/${userReview.id}`);
      // Remove the deleted review from state.
      setReviews(prevReviews =>
        prevReviews.filter(review => review.id !== userReview.id)
      );
      setUserReview(null);
      setRating(0);
      setComment('');
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-component">
      <h2>Reviews</h2>
      {error && (
        <div className="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      )}

      {/* Review submission form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="rating" style={{ marginRight: '0.5rem' }}>
            Rating:
          </label>
          <Rating
            name="rating"
            value={rating || 0}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            precision={1}
            max={5}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="comment"
            style={{ display: 'block', marginBottom: '0.25rem' }}
          >
            Comment:
          </label>
          <textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            cols={50}
          />
        </div>
        <button
          type="submit"
          disabled={loading || rating === null || rating === 0}
        >
          {loading
            ? 'Submitting...'
            : userReview
            ? 'Update Review'
            : 'Submit Review'}
        </button>
        {/* Show delete button if the user already has a review */}
        {userReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{ marginLeft: '1rem' }}
          >
            Delete Review
          </button>
        )}
      </form>

      {/* List of reviews */}
      <div className="review-list">
        {Array.isArray(reviews) && reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="review-item"
              style={{
                borderBottom: '1px solid #ccc',
                padding: '0.5rem 0',
              }}
            >
              <p>
                <strong>Rating:</strong> {review.rating}
                <span
                  style={{
                    marginLeft: '1rem',
                    fontStyle: 'italic',
                    fontSize: '0.9rem',
                  }}
                >
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleString()
                    : ''}
                </span>
              </p>
              <p>{review.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewComponent;
