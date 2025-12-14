import { Link } from 'react-router-dom';
import { Candy, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Candy className="h-8 w-8 text-primary" />
              <span className="font-serif text-xl font-semibold text-gradient-gold">
                Sweet Shop
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Crafting artisanal sweets with love since 1985. Every treat tells a story of 
              passion, quality ingredients, and timeless recipes passed down through generations.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/catalog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?category=chocolates"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Chocolates
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?category=pastries"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pastries
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?category=cakes"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cakes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Sweet Street</li>
              <li>Candyville, CA 90210</li>
              <li className="pt-2">
                <a href="tel:+1234567890" className="hover:text-foreground transition-colors">
                  (123) 456-7890
                </a>
              </li>
              <li>
                <a href="mailto:hello@sweetshop.com" className="hover:text-foreground transition-colors">
                  hello@sweetshop.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sweet Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
