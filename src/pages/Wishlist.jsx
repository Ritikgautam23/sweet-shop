import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { WishlistItem } from '@/components/wishlist/WishlistItem';
import { useWishlist } from '@/context/WishlistContext';

export default function Wishlist() {
  const { items, totalItems } = useWishlist();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            My <span className="text-gradient-gold">Wishlist</span>
          </h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {items.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <WishlistItem key={item.sweet.id} item={item} />
              ))}
            </div>

            <div className="pt-4">
              <Button asChild variant="ghost" className="gap-2">
                <Link to="/catalog">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-serif text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite sweets for later.
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