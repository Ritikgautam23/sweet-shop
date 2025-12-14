import { useState, useEffect } from 'react';
import { Star, MessageCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

export function ReviewDialog({ sweet, open, onOpenChange }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (open && sweet) {
      fetchReviews();
      if (user) {
        fetchUserReview();
      }
    }
  }, [open, sweet, user]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/sweet/${sweet.id}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/user/${sweet.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (data.success && data.data) {
        setUserReview(data.data);
      }
    } catch (error) {
      // Ignore errors for user review fetch
    }
  };

  const handleReviewSubmit = (newReview) => {
    if (userReview) {
      // Update existing review
      setReviews(prev => prev.map(review =>
        review.id === newReview.id ? { ...review, ...newReview } : review
      ));
      setUserReview(newReview);
    } else {
      // Add new review
      setReviews(prev => [newReview, ...prev]);
      setUserReview(newReview);
    }
    setShowForm(false);
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${userReview.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setReviews(prev => prev.filter(review => review.id !== userReview.id));
        setUserReview(null);
        toast.success('Review deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete review');
      }
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Reviews for {sweet.name}
          </DialogTitle>
          <DialogDescription>
            Read reviews and share your experience
          </DialogDescription>
        </DialogHeader>

        {/* Rating Summary */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{averageRating}</div>
            <div className="flex gap-1 justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>

          <Separator orientation="vertical" className="h-12" />

          <div className="flex-1">
            {user ? (
              userReview ? (
                <div className="space-y-2">
                  <p className="text-sm">You've already reviewed this sweet</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowForm(true)}
                    >
                      Edit Review
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteReview}
                    >
                      Delete Review
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowForm(true)}>
                  Write a Review
                </Button>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Login to write a review
              </p>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {userReview ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ReviewForm
              sweetId={sweet.id}
              existingReview={userReview}
              onReviewSubmit={handleReviewSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <Separator />
          <h3 className="font-medium">All Reviews</h3>
          <ReviewList reviews={reviews} loading={loading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}