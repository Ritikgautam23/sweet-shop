import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Award, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { SweetCard } from '@/components/sweets/SweetCard';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const features = [
  {
    icon: Sparkles,
    title: 'Handcrafted Quality',
    description: 'Every sweet is made with love using only the finest ingredients.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free shipping on orders over $50. Same-day delivery available.',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized for excellence in confectionery since 1985.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Family recipes passed down through generations.',
  },
];

const API_BASE_URL = 'http://localhost:5000/api';

export default function Index() {
  const [featuredSweets, setFeaturedSweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedSweets();
  }, []);

  const fetchFeaturedSweets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sweets`);
      const data = await response.json();

      if (data.success) {
        setFeaturedSweets(data.data.slice(0, 4));
      } else {
        toast.error('Failed to load featured sweets');
      }
    } catch (error) {
      toast.error('Failed to load featured sweets');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              <span className="text-gradient-gold">Indulge</span> in
              <br />
              Sweet Perfection
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover our handcrafted collection of artisanal chocolates, 
              pastries, and confections made with love and the finest ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button asChild size="lg" className="gap-2">
                <Link to="/catalog">
                  Explore Our Sweets
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-lg bg-gradient-to-b from-card to-transparent border border-border/50 hover:border-primary/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sweets */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="text-gradient-gold">Treats</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our most beloved creations, handpicked for your enjoyment.
            </p>
          </div>

          {loading ? (
            <div className="text-center">Loading featured sweets...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-stretch">
              {featuredSweets.map((sweet, index) => (
                <div key={sweet.id} className="animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                  <SweetCard sweet={sweet} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/catalog">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Satisfy Your Sweet Tooth?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of happy customers who indulge in our premium confections.
            Sign up today and get 10% off your first order!
          </p>
          <Button asChild size="lg">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
