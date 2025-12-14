import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination.tsx';
import { SweetCard } from './SweetCard';
import { SweetFilters as FilterComponent } from './SweetFilters';
import { SweetForm } from './SweetForm';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function SweetGrid({ sweets, pagination, filters, onFiltersChange, onPageChange, onSweetsChange }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showAddDialog, setShowAddDialog] = useState(false);

  const maxPrice = useMemo(() => {
    // Since sweets are paginated, maxPrice might not be accurate, but for slider, use a default or calculate from current
    return Math.max(1000, ...sweets.map(s => s.price));
  }, [sweets]);

  const handleUpdate = (updated) => {
    const newSweets = sweets.map((s) => (s.id === updated.id ? updated : s));
    onSweetsChange?.(newSweets);
    toast.success('Sweet updated successfully');
  };

  const handleDelete = (id) => {
    const newSweets = sweets.filter((s) => s.id !== id);
    onSweetsChange?.(newSweets);
    toast.success('Sweet deleted successfully');
  };

  const handleRestock = (id, amount) => {
    const newSweets = sweets.map((s) =>
      s.id === id ? { ...s, quantity: s.quantity + amount, updatedAt: new Date().toISOString() } : s
    );
    onSweetsChange?.(newSweets);
    toast.success(`Added ${amount} units to stock`);
  };

  const handleAdd = (sweet) => {
    onSweetsChange?.([sweet, ...sweets]);
    setShowAddDialog(false);
    toast.success('Sweet added successfully');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold">Our Sweets</h2>
          <p className="text-muted-foreground">
            {pagination.total || sweets.length} {(pagination.total || sweets.length) === 1 ? 'item' : 'items'} found
          </p>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Sweet
          </Button>
        )}
      </div>

      <FilterComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        maxPrice={maxPrice}
      />

      {sweets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {sweets.map((sweet) => (
            <SweetCard
              key={sweet.id}
              sweet={sweet}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onRestock={handleRestock}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No sweets found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.page > 1 && onPageChange(pagination.page - 1)}
                  className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={page === pagination.page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => pagination.page < pagination.pages && onPageChange(pagination.page + 1)}
                  className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Sweet Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Sweet</DialogTitle>
            <DialogDescription>Create a new sweet item for your catalog.</DialogDescription>
          </DialogHeader>
          <SweetForm onSubmit={handleAdd} onCancel={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
