import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { items, totalItems } = useCart();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Shopping <span className="text-gradient-gold">Cart</span>
          </h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.sweet.id} item={item} />
              ))}
              
              <div className="pt-4">
                <Button asChild variant="ghost" className="gap-2">
                  <Link to="/catalog">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            <div>
              <CartSummary />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-serif text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any sweets yet.
            </p>
            <Button asChild>
              <Link to="/catalog">Browse Our Sweets</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
