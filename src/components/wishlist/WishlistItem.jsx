import { Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export function WishlistItem({ item }) {
  const { removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { sweet } = item;

  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border border-border">
      <img
        src={sweet.image}
        alt={sweet.name}
        className="w-24 h-24 object-cover rounded-md"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-serif font-semibold truncate">{sweet.name}</h3>
        <p className="text-sm text-muted-foreground capitalize">{sweet.category}</p>
        <p className="text-primary font-bold mt-1">${sweet.price.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {sweet.quantity} in stock
        </p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => removeFromWishlist(sweet.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => addToCart(sweet)}
          disabled={sweet.quantity === 0}
          variant={isInCart(sweet.id) ? 'secondary' : 'default'}
          className="gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          {isInCart(sweet.id) ? 'In Cart' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}