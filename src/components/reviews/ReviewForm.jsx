import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

export function ReviewForm({ sweetId, existingReview, onReviewSubmit, onCancel }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);

    try {
      const url = existingReview
        ? `${API_BASE_URL}/reviews/${existingReview.id}`
        : `${API_BASE_URL}/reviews`;

      const method = existingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sweetId,
          rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(existingReview ? 'Review updated successfully' : 'Review submitted successfully');
        onReviewSubmit?.(data.data);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
          Comment
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts about this sweet..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          className="resize-none"
        />
        <div className="text-xs text-muted-foreground mt-1">
          {comment.length}/500 characters
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="gap-2">
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}