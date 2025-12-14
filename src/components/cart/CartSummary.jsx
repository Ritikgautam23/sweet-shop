import { ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function CartSummary() {
  const { totalItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + shipping + tax;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to complete your purchase');
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
      <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>

      {shipping === 0 && (
        <p className="text-xs text-primary mt-2">
          ✓ You qualify for free shipping!
        </p>
      )}

      <Separator className="my-4" />

      <div className="flex justify-between font-semibold text-lg mb-6">
        <span>Total</span>
        <span className="text-primary">${grandTotal.toFixed(2)}</span>
      </div>

      <div className="space-y-3">
        <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
          <ShoppingBag className="h-4 w-4" />
          Checkout
        </Button>
        
        <Button
          variant="outline"
          className="w-full gap-2 text-muted-foreground"
          onClick={clearCart}
        >
          <Trash2 className="h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Free shipping on orders over $50
      </p>
    </div>
  );
}
