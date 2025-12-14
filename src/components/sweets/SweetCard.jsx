import { useState } from 'react';
import { ShoppingCart, Edit, Trash2, Plus, Package, Star, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { SweetForm } from './SweetForm';
import { ReviewDialog } from '../reviews/ReviewDialog';

export function SweetCard({ sweet, onUpdate, onDelete, onRestock }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [restockAmount, setRestockAmount] = useState(10);

  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isAdmin = user?.role === 'admin';
  const isOutOfStock = sweet.quantity === 0;
  const isLowStock = sweet.quantity > 0 && sweet.quantity <= (sweet.lowStockThreshold || 10);
  const isWishlisted = isInWishlist(sweet.id);

  const categoryColors = {
    chocolates: 'bg-amber-900/50 text-amber-200',
    candies: 'bg-pink-900/50 text-pink-200',
    pastries: 'bg-orange-900/50 text-orange-200',
    cookies: 'bg-yellow-900/50 text-yellow-200',
    cakes: 'bg-rose-900/50 text-rose-200',
    'ice-cream': 'bg-cyan-900/50 text-cyan-200',
  };

  return (
    <>
      <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={sweet.image}
            alt={sweet.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <Badge className={`absolute top-3 left-3 ${categoryColors[sweet.category] || 'bg-secondary'}`}>
            {sweet.category.charAt(0).toUpperCase() + sweet.category.slice(1)}
          </Badge>

          {/* Stock Badge */}
          {isOutOfStock ? (
            <Badge variant="destructive" className="absolute top-3 right-3">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="secondary" className="absolute top-3 right-3 bg-orange-500 text-white">
              Low Stock
            </Badge>
          ) : (
            <Badge variant="secondary" className="absolute top-3 right-3 bg-green-500 text-white">
              In Stock
            </Badge>
          )}
          
          {/* Admin Actions */}
          {isAdmin && (
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => setShowRestockDialog(true)}
              >
                <Package className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {sweet.name}
            </h3>
            <span className="text-primary font-bold text-lg">
              ${sweet.price.toFixed(2)}
            </span>
          </div>

          {/* Rating Display */}
          {sweet.averageRating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(sweet.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{sweet.averageRating}</span>
              <span className="text-xs text-muted-foreground">
                ({sweet.reviewCount} review{sweet.reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {sweet.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                {isOutOfStock ? 'Out of stock' : isLowStock ? 'Low stock' : `${sweet.quantity} in stock`}
              </span>
              {sweet.reviewCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReviewDialog(true)}
                  className="h-6 px-2 text-xs gap-1"
                >
                  <MessageCircle className="h-3 w-3" />
                  Reviews
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => isWishlisted ? removeFromWishlist(sweet.id) : addToWishlist(sweet)}
                className={`gap-1 ${isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                disabled={isOutOfStock}
                variant={isInCart(sweet.id) ? 'secondary' : 'default'}
                onClick={() => addToCart(sweet)}
                className="gap-2"
              >
                {isInCart(sweet.id) ? (
                  <>
                    <Plus className="h-4 w-4" />
                    Add More
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Sweet</DialogTitle>
            <DialogDescription>Make changes to this sweet item.</DialogDescription>
          </DialogHeader>
          <SweetForm
            sweet={sweet}
            onSubmit={(updated) => {
              onUpdate?.(updated);
              setShowEditDialog(false);
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sweet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{sweet.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.(sweet.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Sweet</DialogTitle>
            <DialogDescription>
              Add more units of "{sweet.name}" to inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Quantity to Add</label>
            <input
              type="number"
              min="1"
              value={restockAmount}
              onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestockDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onRestock?.(sweet.id, restockAmount);
                setShowRestockDialog(false);
              }}
            >
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <ReviewDialog
        sweet={sweet}
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
      />
    </>
  );
}
