import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

export function CartItem({ item, readonly = false }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { sweet, quantity } = item;

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
      </div>

      <div className="flex flex-col items-end justify-between">
        {!readonly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeFromCart(sweet.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-2">
          {!readonly && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(sweet.id, quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(sweet.id, quantity + 1)}
                disabled={quantity >= sweet.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
          {readonly && (
            <span className="text-sm font-medium">Qty: {quantity}</span>
          )}
        </div>

        <p className="text-sm font-medium">
          ${(sweet.price * quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
