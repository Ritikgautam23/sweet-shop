import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SweetGrid } from '@/components/sweets/SweetGrid';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Catalog() {
  const [sweets, setSweets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    dateFrom: '',
    dateTo: '',
    sortBy: 'name',
    inStock: false,
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    fetchSweets();
  }, [filters]);

  const fetchSweets = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            if (value.length > 0) params.append(key, value.join(','));
          } else if (typeof value === 'boolean') {
            params.append(key, value.toString());
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/sweets?${params}`);
      const data = await response.json();

      if (data.success) {
        const formattedSweets = data.data.map((sweet) => ({
          id: sweet.id,
          name: sweet.name,
          description: sweet.description,
          category: sweet.category,
          price: sweet.price,
          quantity: sweet.quantity,
          image: sweet.image,
          averageRating: sweet.averageRating || 0,
          reviewCount: sweet.reviewCount || 0,
          createdAt: sweet.createdAt,
          updatedAt: sweet.updatedAt,
        }));
        setSweets(formattedSweets);
        setPagination(data.pagination || {});
      } else {
        toast.error('Failed to load sweets');
      }
    } catch (error) {
      toast.error('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 }); // Reset to page 1 on filter change
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleSweetsChange = (newSweets) => {
    // For admin actions, refetch to get updated list
    fetchSweets();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center">Loading sweets...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Our <span className="text-gradient-gold">Catalog</span>
          </h1>
          <p className="text-muted-foreground">
            Browse our complete collection of handcrafted sweets and treats.
          </p>
        </div>

        <SweetGrid
          sweets={sweets}
          pagination={pagination}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onPageChange={handlePageChange}
          onSweetsChange={handleSweetsChange}
        />
      </div>
    </Layout>
  );
}
